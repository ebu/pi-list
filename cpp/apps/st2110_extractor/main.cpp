#include "bisect/bicla.h"
#include "bisect/bimo/mq/sender.h"
#include "db_handler_factory.h"
#include "ebu/list/analysis/full_analysis.h"
#include "ebu/list/definitions/exchanges.h"
#include "ebu/list/version.h"
#include "null_handler_factory.h"
#include <fstream>

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::st2110_extractor;
using namespace ebu_list::analysis;
using nlohmann::json;

//------------------------------------------------------------------------------

namespace
{
    analysis_profile load_profile(const path& profile_file)
    {
        std::ifstream i(profile_file.string());
        LIST_ENFORCE(i.is_open(), std::runtime_error, "Error opening '{}'", profile_file.string());
        json j;
        i >> j;
        return j.get<analysis_profile>();
    }

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        auto [parse_result, config] =
            parse(argc, argv,
                  option(&config::id_to_process, "s", "stream id",
                         "One or more stream ids to process. If none is "
                         "specified, processes all streams in the file."),
                  option(&config::analysis_profile_file, "p", "analysis profile file",
                         "The file with the analysis profile, in JSON"),
                  argument(&config::pcap_id, "pcap id", "the pcap id to be processed"),
                  argument(&config::pcap_file, "pcap file", "the path to the pcap file within the filesystem"),
                  argument(&config::storage_folder, "storage dir",
                           "the path to a storage folder where some "
                           "information is writen"),
                  option(&config::influxdb_url, "influx_url", "influxDB url",
                         "url to influxDB. Usually http://localhost:8086"),
                  option(&config::mongo_db_url, "mongo_url", "mongo url",
                         "url to mongoDB. Usually mongodb://localhost:27017."),
                  option(&config::rabbit_mq_url, "rabbit_mq_url", "RabbitMQ URL",
                         "url to mongoDB. Usually amqp://localhost:5672."),
                  option(&config::extract_frames, "e", "extract frames", "Set this to extract frames."));

        config.profile = load_profile(config.analysis_profile_file);
        logger()->info("Using analysis profile with id {}", config.profile.id);

        LIST_ENFORCE(config.rabbit_mq_url.has_value(), std::runtime_error, "No Rabbit MQ URL on command line");

        if(parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    using stream_with_details_map = std::map<std::string, stream_with_details>;

    stream_with_details_map get_ids_to_process(const db_serializer& db, const config& config)
    {
        const auto look_for = nlohmann::json{{"pcap", config.pcap_id}};
        const auto r        = db.find_many(constants::db::offline, constants::db::collections::streams, look_for);

        stream_with_details_map found_streams;
        std::for_each(r.begin(), r.end(), [&found_streams](const auto& j) {
            const auto v = stream_with_details_serializer::from_json(j);
            found_streams.insert({v.first.id, v});
        });

        if(!config.id_to_process.has_value()) return found_streams;

        const auto wanted_stream_it = found_streams.find(config.id_to_process.value());
        LIST_ENFORCE(wanted_stream_it != found_streams.end(), std::runtime_error, "Didn't find specified stream: {}",
                     config.id_to_process.value());

        stream_with_details_map ret;
        ret.insert({config.id_to_process.value(), wanted_stream_it->second});
        return ret;
    }

    void update_tr_info(const tro_map& info, stream_with_details_map& streams)
    {
        for(const auto& [id, tro] : info)
        {
            auto& stream                    = streams[id];
            auto& video_info                = std::get<video_stream_details>(stream.second);
            video_info.video.tro_default_ns = tro.tro_default_ns;
            video_info.video.avg_tro_ns     = tro.avg_tro_ns;
            video_info.video.min_tro_ns     = tro.min_tro_ns;
            video_info.video.max_tro_ns     = tro.max_tro_ns;
        }
    }

    void run(const config& config)
    {
        const auto db_url = config.mongo_db_url.value_or(MONGO_DEFAULT_URL);
        db_serializer db(db_url);

        auto streams_to_process = get_ids_to_process(db, config);

        if(!config.extract_frames)
        {
            // TODO: we no longer need to calculate this up front. This should be done on the fly, with the other
            // measurements.
            const auto start_time = std::chrono::steady_clock::now();
            const auto tro_info   = calculate_average_troffset(config.pcap_file, streams_to_process);
            update_tr_info(tro_info, streams_to_process);
            const auto delta = std::chrono::steady_clock::now() - start_time;
            logger()->info("TR info calculation: {}ms",
                           std::chrono::duration_cast<std::chrono::milliseconds>(delta).count());
        }

        ///
        const auto look_for = nlohmann::json{{"id", config.pcap_id}};
        const auto result   = db.find_one(constants::db::offline, constants::db::collections::pcaps, look_for);
        LIST_ENFORCE(result, std::runtime_error, "Can't find pcap {} on DB", config.pcap_id);
        auto pcap = pcap_info::from_json(result.value());
        ///

        const auto get_stream_info =
            [&streams_to_process](const bool is_srt,
                                  const udp::datagram& first_datagram) -> std::optional<stream_with_details> {
            uint32_t ssrc = 0;
            if(!is_srt)
            {
                auto maybe_rtp_packet =
                    rtp::decode(first_datagram.ethernet_info, first_datagram.info, first_datagram.sdu);
                if(!maybe_rtp_packet)
                {
                    return std::nullopt;
                }

                auto first_packet = std::move(maybe_rtp_packet.value());

                ssrc = first_packet.info.rtp.view().ssrc();
            }

            const ipv4::endpoint source      = {first_datagram.info.source_address, first_datagram.info.source_port};
            const ipv4::endpoint destination = {first_datagram.info.destination_address,
                                                first_datagram.info.destination_port};

            const auto stream_info_it =
                std::find_if(streams_to_process.begin(), streams_to_process.end(), [&](const auto& entry) {
                    const stream_with_details& details = entry.second;
                    const auto& s                      = details.first;
                    return s.network.ssrc == ssrc && s.network.source == source && s.network.destination == destination;
                });

            if(stream_info_it == streams_to_process.end()) return std::nullopt;
            return stream_info_it->second;
        };

        bisect::bimo::mq::exchange_sender exchange_sender(config.rabbit_mq_url.value(),
                                                          ebu_list::definitions::exchanges::extractor_status::info);

        auto progress_callback = [&exchange_sender, &pcap](float percentage) {
            // logger()->info("Progress: {} %", percentage);
            json response;
            response["id"]         = pcap.id;
            response["percentage"] = percentage;
            exchange_sender.send(ebu_list::definitions::exchanges::extractor_status::keys::progress, response.dump());
        };

        db_handler_factory factory(config);
        //        null_handler_factory factory(config);

        db_updater updater(db, config.storage_folder);

        const auto is_srt = pcap.transport_type == "SRT";
        auto context      = processing_context{
            config.pcap_file, config.profile,    config.storage_folder, pcap,  get_stream_info, &factory,
            &updater,         progress_callback, config.extract_frames, is_srt};

        run_full_analysis(context);
    }
} // namespace

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    logger()->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    try
    {
        const auto start_time = std::chrono::steady_clock::now();

        run(config);

        const auto end_time        = std::chrono::steady_clock::now();
        const auto processing_time = end_time - start_time;
        const auto processing_time_ms =
            static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
        logger()->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);
    }
    catch(std::exception& ex)
    {
        logger()->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
