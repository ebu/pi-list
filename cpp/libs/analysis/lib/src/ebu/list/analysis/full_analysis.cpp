#include "ebu/list/analysis/full_analysis.h"
#include "ebu/list/analysis/handlers/anc_stream_handler.h"
#include "ebu/list/analysis/handlers/audio_stream_handler.h"
#include "ebu/list/analysis/handlers/video_stream_handler.h"
#include "ebu/list/analysis/serialization/anc_stream_serializer.h"
#include "ebu/list/analysis/serialization/audio_stream_serializer.h"
#include "ebu/list/analysis/serialization/video_stream_serializer.h"
#include "ebu/list/analysis/utils/multi_listener.h"
#include "ebu/list/core/platform/executor.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/ptp/udp_filter.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::analysis;

namespace
{
    template <class T> nlohmann::json gather_info(const serializable_stream_info& info, const T& details)
    {
        auto j = serializable_stream_info::to_json(info);
        j.merge_patch(T::to_json(details));

        return j;
    }

    void video_finalizer(const processing_context& context, const video_stream_serializer& handler)
    {
        const auto analysis_info = handler.get_video_analysis_info();
        const auto& network_info = handler.network_info();

        auto video_info            = handler.info();
        auto j                     = ::gather_info(network_info, video_info);
        j["global_video_analysis"] = nlohmann::json(analysis_info);

        context.updater->update_stream_info(network_info.id, j);

        st2110::d20::st2110_20_sdp_serializer s(handler.info().video);
        ebu_list::sdp::sdp_builder sdp({"LIST Generated SDP", "Video flow"});
        sdp.add_media(network_info, s);
        context.updater->update_sdp(network_info.id, sdp, media::media_type::VIDEO);
    }

    void audio_finalizer(const processing_context& context, const audio_stream_handler& handler)
    {
        const auto& network_info = handler.network_info();
        auto j                   = ::gather_info(network_info, handler.info());
        context.updater->update_stream_info(network_info.id, j);

        st2110::d30::st2110_30_sdp_serializer s(handler.info().audio);
        ebu_list::sdp::sdp_builder sdp({"LIST Generated SDP", "audio flow"});
        sdp.add_media(network_info, s);
        context.updater->update_sdp(network_info.id, sdp, media::media_type::AUDIO);
    }

    void anc_finalizer(const processing_context& context, const anc_stream_handler& handler)
    {
        const auto& network_info = handler.network_info();
        auto j                   = ::gather_info(network_info, handler.info());
        context.updater->update_stream_info(network_info.id, j);

        st2110::d40::st2110_40_sdp_serializer s(handler.info().anc);
        ebu_list::sdp::sdp_builder sdp({"LIST Generated SDP", "Ancillary flow"});
        sdp.add_media(network_info, s);
        context.updater->update_sdp(network_info.id, sdp, media::media_type::ANCILLARY_DATA);
    }

    clock::duration get_timestamp_offset(const analysis_profile& profile, const pcap_info& pcap)
    {
        if (profile.timestamps.source == timestamps_source::pcap)
        {
            logger()->info("Using raw pcap timestamps");
            return {};
        }
        logger()->info("Using PTP packets to derive pcap timestamp offset: {} ns",
                       std::chrono::duration_cast<std::chrono::nanoseconds>(pcap.offset_from_ptp_clock).count());

        return pcap.offset_from_ptp_clock;
    }
} // namespace

void analysis::run_full_analysis(processing_context& context)
{
    std::atomic_int nr_audio = 0;
    std::atomic_int nr_video = 0;
    std::atomic_int nr_anc   = 0;
    std::atomic_int nr_total = 0;

    std::atomic_int nr_wide          = 0;
    std::atomic_int nr_narrow        = 0;
    std::atomic_int nr_narrow_linear = 0;
    std::atomic_int nr_not_compliant = 0;

    auto main_executor = std::make_shared<executor>();

    auto video_finalizer_callback = [&](const video_stream_serializer& handler) {
        const auto analysis_info = handler.get_video_analysis_info();
        switch (analysis_info.compliance)
        {
        case compliance_profile::narrow: ++nr_narrow; break;
        case compliance_profile::narrow_linear: ++nr_narrow_linear; break;
        case compliance_profile::wide: ++nr_wide; break;
        case compliance_profile::not_compliant: ++nr_not_compliant; break;
        }

        video_finalizer(context, handler);
    };

    auto audio_finalizer_callback = [&context](const audio_stream_handler& ash) { audio_finalizer(context, ash); };
    auto anc_finalizer_callback   = [&context](const anc_stream_handler& ash) { anc_finalizer(context, ash); };

    auto create_handler = [&](const rtp::packet& first_packet) -> rtp::listener_uptr {
        ++nr_total;

        const auto maybe_stream_info = context.get_stream_info(first_packet);

        if (!maybe_stream_info)
        {
            logger()->warn("Bypassing stream with ssrc: {}", first_packet.info.rtp.view().ssrc());
            logger()->warn("\tdestination: {}", to_string(ipv4::endpoint{first_packet.info.udp.destination_address,
                                                                         first_packet.info.udp.destination_port}));
            auto handler = std::make_unique<rtp::null_listener>();
            return handler;
        }

        const auto& stream_info = maybe_stream_info->first;
        const auto& media_info  = maybe_stream_info->second;

        if (stream_info.type == media::media_type::VIDEO)
        {
            ++nr_video;
            const auto& in_video_info = std::get<video_stream_details>(media_info);
            const auto video_info     = media::video::info{in_video_info.video.rate, in_video_info.video.scan_type,
                                                       in_video_info.video.dimensions};

            auto new_handler = std::make_unique<video_stream_serializer>(first_packet, stream_info, in_video_info,
                                                                         context.storage_folder, main_executor,
                                                                         video_finalizer_callback);
            auto ml          = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
            ml->add(std::move(new_handler));

            {
                auto db_logger    = context.handler_factory->create_c_inst_data_logger(context.pcap.id, stream_info.id);
                auto cinst_writer = context.handler_factory->create_c_inst_histogram_logger(stream_info.id);
                auto analyzer     = std::make_unique<c_analyzer>(std::move(db_logger), std::move(cinst_writer),
                                                             in_video_info.video.packets_per_frame, video_info.rate);
                ml->add(std::move(analyzer));
            }

            {
                auto framer_ml =
                    std::make_unique<multi_listener_t<frame_start_filter::listener, frame_start_filter::packet_info>>();

                {
                    auto db_logger = context.handler_factory->create_rtp_ts_logger(context.pcap.id, stream_info.id);
                    auto analyzer  = std::make_unique<rtp_ts_analyzer>(std::move(db_logger), video_info.rate);
                    framer_ml->add(std::move(analyzer));
                }

                {
                    auto db_logger  = context.handler_factory->create_vrx_data_logger(context.pcap.id, stream_info.id,
                                                                                     "gapped-ideal");
                    auto vrx_writer = context.handler_factory->create_vrx_histogram_logger(stream_info.id);
                    const auto settings = vrx_settings{in_video_info.video.schedule, tvd_kind::ideal, std::nullopt};
                    auto analyzer =
                        std::make_unique<vrx_analyzer>(std::move(db_logger), std::move(vrx_writer),
                                                       in_video_info.video.packets_per_frame, video_info, settings);
                    framer_ml->add(std::move(analyzer));
                }

                {
                    auto db_logger = context.handler_factory->create_vrx_data_logger(context.pcap.id, stream_info.id,
                                                                                     "gapped-adjusted-avg-tro");
                    const auto settings = vrx_settings{in_video_info.video.schedule, tvd_kind::ideal,
                                                       std::chrono::nanoseconds(in_video_info.video.avg_tro_ns)};
                    auto analyzer =
                        std::make_unique<vrx_analyzer>(std::move(db_logger), histogram_listener_uptr(),
                                                       in_video_info.video.packets_per_frame, video_info, settings);
                    framer_ml->add(std::move(analyzer));
                }

                auto framer =
                    std::make_unique<frame_start_filter>(frame_start_filter::listener_uptr(std::move(framer_ml)));
                ml->add(std::move(framer));
            }

            return ml;
        }
        else if (stream_info.type == media::media_type::AUDIO)
        {
            ++nr_audio;
            const auto& audio_info = std::get<audio_stream_details>(media_info);
            auto new_handler       = std::make_unique<audio_stream_serializer>(
                first_packet, stream_info, audio_info, audio_finalizer_callback, context.storage_folder);
            auto ml = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
            ml->add(std::move(new_handler));

            {
                auto db_rtp_logger =
                    context.handler_factory->create_audio_rtp_logger(context.pcap.id, stream_info.id, "audio");
                auto db_tsdf_logger =
                    context.handler_factory->create_audio_tsdf_logger(context.pcap.id, stream_info.id, "audio");
                auto analyzer = std::make_unique<audio_timing_analyser>(
                    first_packet, std::move(db_rtp_logger), std::move(db_tsdf_logger),
                    ebu_list::media::audio::to_int(audio_info.audio.sampling));
                ml->add(std::move(analyzer));
            }
            return ml;
        }
        else if (stream_info.type == media::media_type::ANCILLARY_DATA)
        {
            ++nr_anc;
            const auto& anc_info = std::get<anc_stream_details>(media_info);
            auto new_handler     = std::make_unique<anc_stream_serializer>(first_packet, stream_info, anc_info,
                                                                       anc_finalizer_callback, context.storage_folder);
            return new_handler;
        }
        else
        {
            logger()->warn(
                "Bypassing stream with destination: {}. Reason: Unknown media type",
                ipv4::endpoint{first_packet.info.udp.destination_address, first_packet.info.udp.destination_port});
            auto handler = std::make_unique<rtp::null_listener>();
            return handler;
        }
    };

    auto ptp_logger = context.handler_factory->create_ptp_logger(context.pcap.id);
    auto ptp_sm     = std::make_shared<ptp::state_machine>(ptp_logger);
    auto handler    = std::make_shared<rtp::udp_handler>(create_handler);
    auto filter     = std::make_shared<ptp::udp_filter>(ptp_sm, handler);

    auto player = std::make_unique<pcap::pcap_player>(context.pcap_file, filter, on_error_exit,
                                                      -get_timestamp_offset(context.profile, context.pcap));

    auto launcher = launch(std::move(player));

    launcher.wait();
    main_executor->wait();

    context.pcap.analyzed              = true;
    context.pcap.audio_streams         = nr_audio.load();
    context.pcap.video_streams         = nr_video.load();
    context.pcap.anc_streams           = nr_anc.load();
    context.pcap.total_streams         = nr_total.load();
    context.pcap.wide_streams          = nr_wide.load();
    context.pcap.narrow_streams        = nr_narrow.load();
    context.pcap.narrow_linear_streams = nr_narrow_linear.load();
    context.pcap.not_compliant_streams = nr_not_compliant.load();

    context.updater->update_pcap_info(context.pcap.id, pcap_info::to_json(context.pcap));
}
