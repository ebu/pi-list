#include "ebu/list/version.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/st2110/d21/rtp_ts_analyzer.h"
#include "ebu/list/st2110/d21/vrx_analyzer.h"
#include "ebu/list/st2110/d21/frame_start_filter.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/sdp/sdp_writer.h"
#include "ebu/list/constants.h"
#include "ebu/list/core/platform/executor.h"
#include "ebu/list/utils/multi_listener.h"
#include "ebu/list/ptp/udp_filter.h"
#include "ebu/list/database.h"
#include "ebu/list/serialization/serialization.h"
#include "bisect/bicla.h"
#include "influx_logger.h"
#include "video_stream_serializer.h"
#include "audio_stream_serializer.h"
#include "anc_stream_serializer.h"
#include "troffset_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

namespace
{
    constexpr auto MONGO_DEFAULT_URL = "mongodb://localhost:27017";
    constexpr auto INFLUX_DEFAULT_URL = "http://localhost:8086";
    constexpr auto cinst_file_name = "cinst.json";
    constexpr auto vrx_file_name = "vrx.json";


    struct config
    {
        std::string pcap_id;
        path pcap_file;
        path storage_folder;
        std::optional<std::string> influxdb_url;
        std::optional<std::string> mongo_db_url;
        std::optional<std::string> id_to_process;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto[parse_result, config] = parse(argc, argv,
            option(&config::id_to_process, "s", "stream id", "One or more stream ids to process. If none is specified, processes all streams in the file."),
            argument(&config::pcap_id, "pcap id", "the pcap id to be processed"),
            argument(&config::pcap_file, "pcap file", "the path to the pcap file within the filesystem"),
            argument(&config::storage_folder, "storage dir", "the path to a storage folder where some information is writen"),
            option(&config::influxdb_url, "influx_url", "influxDB url", "url to influxDB. Usually http://localhost:8086"),
            option(&config::mongo_db_url, "mongo_url", "mongo url", "url to mongoDB. Usually mongodb://localhost:27017.")
        );

        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    ptp::state_machine_listener_ptr get_ptp_influx_logger(std::optional<std::string> influxdb_url, std::string pcap_uuid)
    {
        if (influxdb_url)
        {
            return std::make_shared<influx::influxdb_ptp_logger>(influxdb_url.value_or(INFLUX_DEFAULT_URL), pcap_uuid);
        }
        else
        {
            return std::make_shared<ptp::null_state_machine_listener>();
        }
    }

    std::vector<stream_with_details> get_ids_to_process(const db_serializer& db, const config& config)
    {
        const auto look_for = nlohmann::json{ {"pcap", config.pcap_id} };
        const auto r = db.find_many(constants::db::offline, constants::db::collections::streams, look_for);

        std::vector<stream_with_details> found_streams;
        std::transform(r.begin(), r.end(), std::back_inserter(found_streams), [](const auto& j){
            return stream_with_details_serializer::from_json(j);
        });

        if (!config.id_to_process.has_value()) return found_streams;

        const auto wanted_stream_it = std::find_if(begin(found_streams), end(found_streams), [&](const auto& info) {
            const auto& id = info.first.id;
            return id == config.id_to_process.value();
        });

        LIST_ENFORCE(wanted_stream_it != found_streams.end(), std::runtime_error, "Didn't find specified stream: {}", config.id_to_process.value());
        return { *wanted_stream_it };
    }

    void update_one_tr_info(db_serializer& db, std::string stream_id, const tro_stream_info& info)
    {
        const auto stream_to_update = nlohmann::json{ {"id", stream_id} };

        auto maybe_record = db.find_one(constants::db::offline, constants::db::collections::streams, stream_to_update);
        if (!maybe_record) return;
        auto record = maybe_record.value();

        nlohmann::json j;
        j["tro_default_ns"] = info.tro_default_ns;
        j["avg_tro_ns"] = info.avg_tro_ns;
        j["max_tro_ns"] = info.max_tro_ns;
        j["min_tro_ns"] = info.min_tro_ns;

        auto& media = record["media_specific"];
        media.merge_patch(j);

        db.update(constants::db::offline, constants::db::collections::streams, stream_to_update, record);
    }

    void update_tr_info(db_serializer& db, const tro_map& info)
    {
        for (const auto[key, value] : info)
        {
            update_one_tr_info(db, key, value);
        }
    }

    template<class T>
    nlohmann::json gather_info(const serializable_stream_info& info, const T& details)
    {
        auto j = serializable_stream_info::to_json(info);
        j.merge_patch(T::to_json(details));

        return j;
    }

    void run(logger_ptr logger, const config& config)
    {
        constexpr auto use_offset_from_ptp_clock = false;
        const auto db_url = config.mongo_db_url.value_or(MONGO_DEFAULT_URL);
        db_serializer db {db_url};

        std::atomic_int nr_audio = 0;
        std::atomic_int nr_video = 0;
        std::atomic_int nr_anc = 0;
        std::atomic_int nr_total = 0;

        std::atomic_int nr_wide = 0;
        std::atomic_int nr_narrow = 0;
        std::atomic_int nr_narrow_linear = 0;
        std::atomic_int nr_not_compliant = 0;


        const auto wanted_streams = get_ids_to_process(db, config);

        const auto tro_info = calculate_average_troffset(config.pcap_file, wanted_streams);

        const auto look_for = nlohmann::json{ {"id", config.pcap_id} };
        const auto result = db.find_one(constants::db::offline, constants::db::collections::pcaps, look_for);
        LIST_ENFORCE( result , std::runtime_error, "Can't find pcap {} on DB", config.pcap_id);
        auto pcap = pcap_info::from_json(result.value());

        const auto offset_from_ptp_clock = use_offset_from_ptp_clock ? -pcap.offset_from_ptp_clock : std::chrono::nanoseconds(0);

        auto main_executor = std::make_shared<executor>();

        auto video_dump_handler = [&](const video_stream_serializer& handler)
        {
            const auto analysis_info = handler.get_video_analysis_info();
            switch(analysis_info.compliance)
            {
                case compliance_profile::narrow: nr_narrow++; break;
                case compliance_profile::narrow_linear: nr_narrow_linear++; break;
                case compliance_profile::wide: nr_wide++; break;
                case compliance_profile::not_compliant: nr_not_compliant++; break;
            }

            // save on db
            const auto& network_info = handler.network_info();
            const auto stream_to_update = nlohmann::json{ {"id", network_info.id} };

            auto j = ::gather_info(network_info, handler.info());
            j["global_video_analysis"] = nlohmann::json(analysis_info);
            db.update(constants::db::offline, constants::db::collections::streams, stream_to_update, j);

            st2110::d20::st2110_20_sdp_serializer s(handler.info().video);
            ebu_list::sdp::sdp_writer sdp({"LIST Generated SDP", "Video flow", config.storage_folder / network_info.id / "video.sdp"});
            sdp.add_media(network_info, s);
            sdp.write();
        };

        auto audio_dump_handler = [&](const audio_stream_handler& handler)
        {
            const auto& network_info = handler.network_info();
            const auto stream_to_update = nlohmann::json{ {"id", network_info.id} };

            auto j = ::gather_info(network_info, handler.info());
            db.update(constants::db::offline, constants::db::collections::streams, stream_to_update, j);

            st2110::d30::st2110_30_sdp_serializer s(handler.info().audio);
            ebu_list::sdp::sdp_writer sdp({"LIST Generated SDP", "audio flow", config.storage_folder / network_info.id / "audio.sdp"});
            sdp.add_media(network_info, s);
            sdp.write();
        };

        auto anc_dump_handler = [&](const anc_stream_handler& handler)
        {
            const auto& network_info = handler.network_info();
            const auto stream_to_update = nlohmann::json{ {"id", network_info.id} };

            auto j = ::gather_info(network_info, handler.info());
            db.update(constants::db::offline, constants::db::collections::streams, stream_to_update, j);

            st2110::d40::st2110_40_sdp_serializer s(handler.info().anc);
            ebu_list::sdp::sdp_writer sdp({"LIST Generated SDP", "Ancillary flow", config.storage_folder / network_info.id / "ancillary.sdp"});
            sdp.add_media(network_info, s);
            sdp.write();
        };

        auto create_handler = [&](rtp::packet first_packet) -> rtp::listener_uptr
        {
            nr_total++;
            const auto ssrc = first_packet.info.rtp.view().ssrc();
            const ipv4::endpoint destination = {first_packet.info.udp.destination_address, first_packet.info.udp.destination_port};

            const auto stream_info_it = std::find_if(wanted_streams.begin(), wanted_streams.end(), [&](const stream_with_details& details)
            {
                const auto& s = details.first;
                return s.network.ssrc == ssrc && s.network.destination == destination;
            });

            if (stream_info_it == wanted_streams.end())
            {
                logger->warn("Bypassing stream with ssrc: {}", ssrc);
                logger->warn("\tdestination: {}", to_string(destination));
                auto handler = std::make_unique<rtp::null_listener>();
                return handler;
            }

            const auto& stream_info = stream_info_it->first;

            if( stream_info.type == media::media_type::VIDEO)
            {
                nr_video++;
                const auto& in_video_info = std::get<video_stream_details>(stream_info_it->second);
                const auto video_info = media::video::info
                {
                    in_video_info.video.rate,
                    in_video_info.video.scan_type,
                    in_video_info.video.dimensions
                };

                auto new_handler = std::make_unique<video_stream_serializer>(first_packet, stream_info, in_video_info, config.storage_folder, main_executor, video_dump_handler);
                auto ml = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
                ml->add(std::move(new_handler));

                if (config.influxdb_url)
                {
                    const auto info_path = config.storage_folder / stream_info.id;
                    const auto influx_db_url = config.influxdb_url.value_or(INFLUX_DEFAULT_URL);

                    {
                        auto db_logger = std::make_unique<influx::influxdb_c_inst_logger>(influx_db_url, pcap.id, stream_info.id);
                        auto cinst_writer = std::make_unique<histogram_writer>(info_path, cinst_file_name);
                        auto analyzer = std::make_unique<c_analyzer>(std::move(db_logger), std::move(cinst_writer), in_video_info.video.packets_per_frame, video_info.rate);
                        ml->add(std::move(analyzer));
                    }

                    {
                        auto framer_ml = std::make_unique<multi_listener_t<frame_start_filter::listener, frame_start_filter::packet_info>>();

                        {
                            auto db_logger = std::make_unique<influx::influxdb_rtp_ts_logger>(influx_db_url, pcap.id, stream_info.id);
                            auto analyzer = std::make_unique<rtp_ts_analyzer>(std::move(db_logger), video_info.rate);
                            framer_ml->add(std::move(analyzer));
                        }

                        {
                            auto db_logger = std::make_unique<influx::influxdb_vrx_logger>(influx_db_url, pcap.id, stream_info.id, "gapped-ideal");
                            auto vrx_writer = std::make_unique<histogram_writer>(info_path, vrx_file_name);
                            const auto settings = vrx_settings{ in_video_info.video.schedule, tvd_kind::ideal, std::nullopt };
                            auto analyzer = std::make_unique<vrx_analyzer>(std::move(db_logger), std::move(vrx_writer), in_video_info.video.packets_per_frame, video_info, settings);
                            framer_ml->add(std::move(analyzer));
                        }

                        {
                            auto db_logger = std::make_unique<influx::influxdb_vrx_logger>(influx_db_url, pcap.id, stream_info.id, "gapped-adjusted-avg-tro");
                            const auto it = tro_info.find(stream_info.id);
                            const auto tro = it == tro_info.end() ? 0 : it->second.avg_tro_ns;
                            const auto settings = vrx_settings{ in_video_info.video.schedule, tvd_kind::ideal, std::chrono::nanoseconds(tro) };
                            auto analyzer = std::make_unique<vrx_analyzer>(std::move(db_logger), histogram_listener_uptr(), in_video_info.video.packets_per_frame, video_info, settings);
                            framer_ml->add(std::move(analyzer));
                        }

                        auto framer = std::make_unique<frame_start_filter>(frame_start_filter::listener_uptr(std::move(framer_ml)));
                        ml->add(std::move(framer));
                    }
                }

                return ml;
            }
            else if( stream_info.type == media::media_type::AUDIO )
            {
                nr_audio++;
                const auto& audio_info = std::get<audio_stream_details>(stream_info_it->second);
                auto new_handler = std::make_unique<audio_stream_serializer>(first_packet, stream_info, audio_info, audio_dump_handler, config.storage_folder);
                auto ml = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
                ml->add(std::move(new_handler));

                if (config.influxdb_url)
                {
                    const auto influx_db_url = config.influxdb_url.value_or(INFLUX_DEFAULT_URL);
                    {
                        const auto info_path = config.storage_folder / stream_info.id;

                        auto db_logger = std::make_unique<influx::influxdb_audio_timing_logger>(influx_db_url, pcap.id, stream_info.id, "audio");
                        auto analyzer = std::make_unique<audio_timing_analyser>(first_packet, std::move(db_logger), ebu_list::media::audio::to_int(audio_info.audio.sampling));
                        ml->add(std::move(analyzer));
                    }
                }
                return ml;
            }
            else if( stream_info.type == media::media_type::ANCILLARY_DATA )
            {
                nr_anc++;
                logger->warn("Processing ANC stream with ssrc: {}.", ssrc);
                const auto& anc_info = std::get<anc_stream_details>(stream_info_it->second);
                auto new_handler = std::make_unique<anc_stream_serializer>(first_packet, stream_info, anc_info, anc_dump_handler, config.storage_folder);
                return new_handler;
            }
            else
            {
                logger->warn("Bypassing stream with ssrc: {}. Reason: Unknown media type", ssrc);
                logger->warn("\tdestination: {}", to_string(destination));
                auto handler = std::make_unique<rtp::null_listener>();
                return handler;
            }
        };

        auto ptp_logger = get_ptp_influx_logger(config.influxdb_url, pcap.id);
        auto ptp_sm = std::make_shared<ptp::state_machine>(ptp_logger);
        auto handler = std::make_shared<rtp::udp_handler>(create_handler);
        auto filter = std::make_shared<ptp::udp_filter>(ptp_sm, handler);
        auto player = std::make_unique<pcap::pcap_player>(config.pcap_file, filter, on_error_exit, offset_from_ptp_clock);

        auto launcher = launch(std::move(player));

        launcher.wait();
        main_executor->wait();

        update_tr_info(db, tro_info);

        pcap.analyzed = true;
        pcap.audio_streams = nr_audio.load();
        pcap.video_streams = nr_video.load();
        pcap.anc_streams = nr_anc.load();
        pcap.total_streams = nr_total.load();
        pcap.wide_streams = nr_wide.load();
        pcap.narrow_streams = nr_narrow.load();
        pcap.narrow_linear_streams = nr_narrow_linear.load();
        pcap.not_compliant_streams = nr_not_compliant.load();

        db.update(constants::db::offline, constants::db::collections::pcaps, look_for, pcap_info::to_json(pcap));
    }
}

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    logger()->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    try
    {
        const auto start_time = std::chrono::steady_clock::now();

        run(logger(), config);

        const auto end_time = std::chrono::steady_clock::now();
        const auto processing_time = end_time - start_time;
        const auto processing_time_ms = static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
        logger()->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);
    }
    catch (std::exception& ex)
    {
        logger()->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
