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
#include "ebu/list/serialization/pcap.h"
#include "ebu/list/serialization/serialization.h"
#include "ebu/list/serialization/stream_identification.h"
#include "ebu/list/core/platform/executor.h"
#include "ebu/list/utils/multi_listener.h"
#include "bisect/bicla.h"
#include "ebu/list/handlers/audio_stream_handler.h"
#include "video_stream_serializer.h"
#include "influx_logger.h"
#include "audio_stream_serializer.h"
#include "ebu/list/ptp/udp_filter.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

// TODO: support schedule selection

namespace
{
    struct config
    {
        path pcap_file;
        path pcap_dir;
        std::optional<std::string> influxdb_url;
        std::optional<std::string> id_to_process;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto[parse_result, config] = parse(argc, argv,
            option(&config::id_to_process, "s", "stream id", "One or more stream ids to process. If none is specified, processes all streams in the file."),
            argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"),
            argument(&config::pcap_dir, "base dir", "the path to the pcap directory where to read/write the information"),
            argument(&config::influxdb_url, "influxDB url", "url to influxDB. Usually http://localhost:8086")
            );

        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    ptp::state_machine_listener_ptr get_ptp_influx_logger(std::optional<std::string> influxdb_url, std::string pcap_uuid)
    {
        if (influxdb_url)
        {
            return std::make_shared<influx::influxdb_ptp_logger>(influxdb_url.value(), pcap_uuid);
        }
        else
        {
            return std::make_shared<ptp::null_state_machine_listener>();
        }
    }

    void write_network_info(const serializable_stream_info& info)
    {
        logger()->info("----------------------------------------");
        logger()->info("Stream {}:", info.id);
        logger()->info("\tpayload type: {}", info.network.payload_type);
        logger()->info("\tsource: {}", to_string(info.network.source));
        logger()->info("\tdestination: {}", to_string(info.network.destination));
    }

    std::vector<stream_with_details> get_ids_to_process(const config& config)
    {
        const auto found_streams = scan_folder(config.pcap_dir);

        if (!config.id_to_process.has_value()) return found_streams;

        const auto wanted_stream_it = std::find_if(begin(found_streams), end(found_streams), [&](const auto& info) {
            const auto& id = info.first.id;
            return id == config.id_to_process.value();
        });

        LIST_ENFORCE(wanted_stream_it != found_streams.end(), std::runtime_error, "Didn't find specified stream: {}", config.id_to_process.value());
        return { *wanted_stream_it };
    }

    void run(logger_ptr console, const config& config)
    {
        std::atomic_int nr_audio = 0;
        std::atomic_int nr_video = 0;
        std::atomic_int nr_anc = 0;
        std::atomic_int nr_total = 0;

        std::atomic_int nr_wide = 0;
        std::atomic_int nr_narrow = 0;
        std::atomic_int nr_narrow_linear = 0;
        std::atomic_int nr_not_compliant = 0;

        const auto wanted_streams = get_ids_to_process(config);

        auto pcap = read_pcap_from_json(config.pcap_dir / constants::meta_filename);

        const auto sdp_path = config.pcap_dir / "sdp.sdp";
        ebu_list::sdp::sdp_writer sdp({"LIST Generated SDP", "LIST SDP"});

        auto main_executor = std::make_shared<executor>();

        auto video_dump_handler = [&](const video_stream_serializer& handler)
        {
            const auto& network_info = handler.network_info();
            write_network_info(network_info);

            const auto analysis_info = handler.get_video_analysis_info();
            switch(analysis_info.compliance)
            {

                case compliance_profile::narrow: nr_narrow++; break;
                case compliance_profile::narrow_linear: nr_narrow_linear++; break;
                case compliance_profile::wide: nr_wide++; break;
                case compliance_profile::not_compliant: nr_not_compliant++; break;
            }

            write_stream_info(config.pcap_dir, network_info, handler.info(), analysis_info);
            st2110::d20::st2110_20_sdp_serializer s(handler.info().video);
            sdp.add_media(network_info, s);
        };

        auto audio_dump_handler = [&](const audio_stream_handler& handler)
        {
            const auto& network_info = handler.network_info();
            write_network_info(network_info);

            write_stream_info(config.pcap_dir, network_info, handler.info());
            st2110::d30::st2110_30_sdp_serializer s(handler.info().audio);
            sdp.add_media(network_info, s);
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
                console->warn("Bypassing stream with ssrc: {}", ssrc);
                console->warn("\tdestination: {}", to_string(destination));
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

                auto new_handler = std::make_unique<video_stream_serializer>(first_packet, stream_info, in_video_info, config.pcap_dir, main_executor, video_dump_handler);
                write_stream_info(config.pcap_dir, new_handler->network_info(), new_handler->info());

                auto ml = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
                ml->add(std::move(new_handler));

                if (config.influxdb_url)
                {
                    {
                        const auto info_path = config.pcap_dir / stream_info.id;

                        auto cinst_writer = std::make_shared<c_inst_histogram_writer>(info_path);
                        auto db_logger = std::make_unique<influx::influxdb_c_inst_logger>(cinst_writer, config.influxdb_url.value(), pcap.id, stream_info.id);
                        auto analyzer = std::make_unique<c_analyzer>(std::move(db_logger), in_video_info.video.packets_per_frame, video_info.rate);
                        ml->add(std::move(analyzer));
                    }

                    {
                        auto framer_ml = std::make_unique<multi_listener_t<frame_start_filter::listener, frame_start_filter::packet_info>>();

                        {
                            auto db_logger = std::make_unique<influx::influxdb_rtp_ts_logger>(config.influxdb_url.value(), pcap.id, stream_info.id);
                            auto analyzer = std::make_unique<rtp_ts_analyzer>(std::move(db_logger), video_info.rate);
                            framer_ml->add(std::move(analyzer));
                        }

                        {
                            auto db_logger = std::make_unique<influx::influxdb_vrx_logger>(config.influxdb_url.value(), pcap.id, stream_info.id, "gapped-ideal");
                            const auto settings = vrx_settings{ read_schedule::gapped, tvd_kind::ideal };
                            auto analyzer = std::make_unique<vrx_analyzer>(std::move(db_logger), in_video_info.video.packets_per_frame, video_info, settings);
                            framer_ml->add(std::move(analyzer));
                        }

                        {
                            auto db_logger = std::make_unique<influx::influxdb_vrx_logger>(config.influxdb_url.value(), pcap.id, stream_info.id, "gapped-first_packet_first_frame");
                            const auto settings = vrx_settings{ read_schedule::gapped, tvd_kind::first_packet_first_frame };
                            auto analyzer = std::make_unique<vrx_analyzer>(std::move(db_logger), in_video_info.video.packets_per_frame, video_info, settings);
                            framer_ml->add(std::move(analyzer));
                        }

                        {
                            auto db_logger = std::make_unique<influx::influxdb_vrx_logger>(config.influxdb_url.value(), pcap.id, stream_info.id, "gapped-first_packet_each_frame");
                            const auto settings = vrx_settings{ read_schedule::gapped, tvd_kind::first_packet_each_frame };
                            auto analyzer = std::make_unique<vrx_analyzer>(std::move(db_logger), in_video_info.video.packets_per_frame, video_info, settings);
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
                auto new_handler = std::make_unique<audio_stream_serializer>(first_packet, stream_info, audio_info, audio_dump_handler, config.pcap_dir/*, main_executor*/);
                write_stream_info(config.pcap_dir, new_handler->network_info(), new_handler->info());
                return new_handler;
            }
            else if( stream_info.type == media::media_type::ANCILLARY_DATA )
            {
                nr_anc++;
                console->warn("Bypassing ANC stream with ssrc: {}.", ssrc);
                console->warn("\tdestination: {}", to_string(destination));
                auto handler = std::make_unique<rtp::null_listener>();
                return handler;
            }
            else
            {
                console->warn("Bypassing stream with ssrc: {}. Reason: Unknown media type", ssrc);
                console->warn("\tdestination: {}", to_string(destination));
                auto handler = std::make_unique<rtp::null_listener>();
                return handler;
            }
        };

        auto ptp_logger = get_ptp_influx_logger(config.influxdb_url, pcap.id);
        auto ptp_sm = std::make_shared<ptp::state_machine>(ptp_logger);
        auto handler = std::make_shared<rtp::udp_handler>(create_handler);
        auto filter = std::make_shared<ptp::udp_filter>(ptp_sm, handler);
        auto player = std::make_unique<pcap::pcap_player>(path(config.pcap_file), filter, -pcap.offset_from_ptp_clock);

        const auto start_time = std::chrono::steady_clock::now();

        auto launcher = launch(std::move(player));

        launcher.wait();
        main_executor->wait();

        const auto end_time = std::chrono::steady_clock::now();
        const auto processing_time = end_time - start_time;
        const auto processing_time_ms = static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
        console->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);

        sdp.write_to(sdp_path);

        const auto base_dir = config.pcap_dir.parent_path().remove_filename();
        pcap.analyzed = true;
        pcap.audio_streams = nr_audio.load();
        pcap.video_streams = nr_video.load();
        pcap.anc_streams = nr_anc.load();
        pcap.total_streams = nr_total.load();
        pcap.wide_streams = nr_wide.load();
        pcap.narrow_streams = nr_narrow.load();
        pcap.narrow_linear_streams = nr_narrow_linear.load();
        pcap.not_compliant_streams = nr_not_compliant.load();

        write_pcap_info(base_dir, pcap);
    }
}

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    auto console = logger();
    console->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    try
    {
        run(console, config);
    }
    catch (std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}