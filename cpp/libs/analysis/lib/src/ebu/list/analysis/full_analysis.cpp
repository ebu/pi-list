#include "ebu/list/analysis/full_analysis.h"
#include "ebu/list/analysis/serialization/anc_stream_serializer.h"
#include "ebu/list/analysis/serialization/audio_stream_serializer.h"
#include "ebu/list/analysis/serialization/jpeg_xs_stream_extractor.h"
#include "ebu/list/analysis/serialization/ttml_stream_serializer.h"
#include "ebu/list/analysis/serialization/video_stream_extractor.h"
#include "ebu/list/analysis/serialization/video_stream_serializer.h"
#include "ebu/list/analysis/utils/multi_listener.h"
#include "ebu/list/core/platform/executor.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/ptp/udp_filter.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/st2110/d21/settings.h"
#include "stream_counter.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::st2110::d22;
using namespace ebu_list::analysis;
using nlohmann::json;

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

        st2110::d20::st2110_20_sdp_serializer s(handler.info().video, analysis_info.compliance);
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

    void ttml_finalizer(const processing_context& context, const analysis::ttml::stream_handler& handler)
    {
        const auto& network_info = handler.network_info();
        auto j                   = ::gather_info(network_info, handler.info());
        context.updater->update_stream_info(network_info.id, j);

        // TODO: add TTML support in SDP
        //        ebu_list::ttml::sdp_serializer s;
        //        ebu_list::sdp::sdp_builder sdp({"LIST Generated SDP", "TTML flow"});
        //        sdp.add_media(network_info, s);
        //        context.updater->update_sdp(network_info.id, sdp, media::media_type::TTML);
    }

    clock::duration get_timestamp_offset(const analysis_profile& profile, const pcap_info& pcap)
    {
        if(profile.timestamps.source == timestamps_source::pcap)
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
    stream_counter counter;

    auto main_executor = std::make_shared<executor>();

    auto video_finalizer_callback = [&](const video_stream_serializer& handler) {
        counter.handle_video_completed(handler.get_video_analysis_info());
        video_finalizer(context, handler);
    };
    auto audio_finalizer_callback = [&context, &counter](const audio_stream_handler& ash) {
        counter.handle_audio_completed();
        audio_finalizer(context, ash);
    };
    auto anc_finalizer_callback = [&context, &counter](const anc_stream_handler& ash) {
        counter.handle_anc_completed();
        anc_finalizer(context, ash);
    };
    auto ttml_finalizer_callback = [&context, &counter](const ttml::stream_handler& tsh) {
        counter.handle_ttml_completed();
        ttml_finalizer(context, tsh);
    };

    auto create_handler = [&](const rtp::packet& first_packet) -> rtp::listener_uptr {
        const auto maybe_stream_info = context.get_stream_info(first_packet);

        if(!maybe_stream_info)
        {
            logger()->warn("Bypassing stream with ssrc: {}", first_packet.info.rtp.view().ssrc());
            logger()->warn("\tdestination: {}", to_string(ipv4::endpoint{first_packet.info.udp.destination_address,
                                                                         first_packet.info.udp.destination_port}));
            auto handler = std::make_unique<rtp::null_listener>();
            return handler;
        }

        const auto& stream_info = maybe_stream_info->first;
        const auto& media_info  = maybe_stream_info->second;

        if(media::is_full_media_type_video_raw(stream_info.full_type))
        {
            const auto& in_video_info = std::get<video_stream_details>(media_info);
            const auto video_info     = media::video::info{in_video_info.video.rate, in_video_info.video.scan_type,
                                                       in_video_info.video.dimensions};

            auto ml = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();

            if(context.extract_frames)
            {
                auto new_handler = std::make_unique<video_stream_extractor>(first_packet, stream_info, in_video_info,
                                                                            context.storage_folder, main_executor);
                ml->add(std::move(new_handler));
            }
            else
            {
                auto new_handler = std::make_unique<video_stream_serializer>(
                    first_packet, stream_info, in_video_info, context.storage_folder, video_finalizer_callback);
                ml->add(std::move(new_handler));
                {
                    auto db_logger =
                        context.handler_factory->create_c_inst_data_logger(context.pcap.id, stream_info.id);
                    auto cinst_writer = context.handler_factory->create_c_inst_histogram_logger(stream_info.id);
                    auto analyzer =
                        std::make_unique<c_analyzer>(std::move(db_logger), std::move(cinst_writer),
                                                     in_video_info.video.packets_per_frame, video_info.rate);
                    ml->add(std::move(analyzer));
                }

                {
                    auto pit_writer = context.handler_factory->create_pit_logger(stream_info.id);
                    auto analyzer   = std::make_unique<packet_interval_time_analyzer>(std::move(pit_writer));
                    ml->add(std::move(analyzer));
                }

                {
                    auto framer_ml = std::make_unique<
                        multi_listener_t<frame_start_filter::listener, frame_start_filter::packet_info>>();

                    {
                        auto db_logger = context.handler_factory->create_rtp_ts_logger(context.pcap.id, stream_info.id);
                        auto analyzer  = std::make_unique<rtp_ts_analyzer>(std::move(db_logger), video_info.rate);
                        framer_ml->add(std::move(analyzer));
                    }

                    {
                        auto db_logger = context.handler_factory->create_vrx_data_logger(
                            context.pcap.id, stream_info.id, "gapped-ideal");
                        auto vrx_writer     = context.handler_factory->create_vrx_histogram_logger(stream_info.id);
                        const auto settings = vrx_settings{in_video_info.video.schedule, tvd_kind::ideal, std::nullopt};
                        auto analyzer =
                            std::make_unique<vrx_analyzer>(std::move(db_logger), std::move(vrx_writer),
                                                           in_video_info.video.packets_per_frame, video_info, settings);
                        framer_ml->add(std::move(analyzer));
                    }

                    auto framer =
                        std::make_unique<frame_start_filter>(frame_start_filter::listener_uptr(std::move(framer_ml)));
                    ml->add(std::move(framer));
                }
            }
            return ml;
        }
        else if(media::is_full_media_type_audio_l16(stream_info.full_type) ||
                media::is_full_media_type_audio_l24(stream_info.full_type))
        {
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
            {
                auto pit_writer = context.handler_factory->create_pit_logger(stream_info.id);
                auto analyzer   = std::make_unique<packet_interval_time_analyzer>(std::move(pit_writer));
                ml->add(std::move(analyzer));
            }
            return ml;
        }
        else if(media::is_full_media_type_video_smpte291(stream_info.full_type))
        {
            const auto& anc_info = std::get<anc_stream_details>(media_info);
            auto new_handler     = std::make_unique<anc_stream_serializer>(first_packet, stream_info, anc_info,
                                                                       anc_finalizer_callback, context.storage_folder);
            auto ml              = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
            ml->add(std::move(new_handler));
            {
                auto pit_writer = context.handler_factory->create_pit_logger(stream_info.id);
                auto analyzer   = std::make_unique<packet_interval_time_analyzer>(std::move(pit_writer));
                ml->add(std::move(analyzer));
            }

            {
                auto framer_ml =
                    std::make_unique<multi_listener_t<frame_start_filter::listener, frame_start_filter::packet_info>>();

                {
                    auto db_rtp_ts_logger =
                        context.handler_factory->create_rtp_ts_logger(context.pcap.id, stream_info.id);
                    auto rtp_ts_analyzer_ =
                        std::make_unique<rtp_ts_analyzer>(std::move(db_rtp_ts_logger), anc_info.anc.rate);
                    framer_ml->add(std::move(rtp_ts_analyzer_));

                    auto db_rtp_logger   = context.handler_factory->create_rtp_logger(context.pcap.id, stream_info.id);
                    auto pkt_hist_writer = context.handler_factory->create_pkt_histogram_logger(stream_info.id);
                    auto rtp_analyzer_ =
                        std::make_unique<rtp_analyzer>(std::move(db_rtp_logger), std::move(pkt_hist_writer));
                    framer_ml->add(std::move(rtp_analyzer_));
                }
                auto framer =
                    std::make_unique<frame_start_filter>(frame_start_filter::listener_uptr(std::move(framer_ml)));
                ml->add(std::move(framer));
            }

            return ml;
        }
        else if(media::is_full_media_type_ttml_xml(stream_info.full_type))
        {
            const auto& ttml_info = std::get<ttml::stream_details>(media_info);
            auto doc_logger       = context.handler_factory->create_ttml_document_logger(stream_info.id);

            auto new_handler = std::make_unique<ttml::stream_handler>(first_packet, std::move(doc_logger), stream_info,
                                                                      ttml_info, ttml_finalizer_callback);
            auto ml              = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();
            ml->add(std::move(new_handler));
            {
                auto pit_writer = context.handler_factory->create_pit_logger(stream_info.id);
                auto analyzer   = std::make_unique<packet_interval_time_analyzer>(std::move(pit_writer));
                ml->add(std::move(analyzer));
            }

            return ml;
        }
        else if(media::is_full_media_type_video_jxsv(stream_info.full_type))
        {
            counter.handle_unknown();
            auto ml = std::make_unique<multi_listener_t<rtp::listener, rtp::packet>>();

            if(context.extract_frames)
            {
                auto new_handler = std::make_unique<jpeg_xs_stream_extractor>(first_packet, context.storage_folder,
                                                                              main_executor, stream_info.id);
                ml->add(std::move(new_handler));
            }
            else
            {
                auto pit_writer = context.handler_factory->create_pit_logger(stream_info.id);
                auto analyzer   = std::make_unique<packet_interval_time_analyzer>(std::move(pit_writer));
                ml->add(std::move(analyzer));
            }

            return ml;
        }

        else
        {
            counter.handle_unknown();
            auto pit_writer = context.handler_factory->create_pit_logger(stream_info.id);
            auto analyzer   = std::make_unique<packet_interval_time_analyzer>(std::move(pit_writer));
            return analyzer;
        }
    };

    auto ptp_logger = context.handler_factory->create_ptp_logger(context.pcap.id);
    auto ptp_sm     = std::make_shared<ptp::state_machine>(ptp_logger);
    auto handler    = std::make_shared<rtp::udp_handler>(create_handler);
    auto filter     = std::make_shared<ptp::udp_filter>(ptp_sm, handler);

    auto player =
        std::make_unique<pcap::pcap_player>(context.pcap_file, context.progress_callback, filter, on_error_exit,
                                            -get_timestamp_offset(context.profile, context.pcap));

    auto launcher = launch(std::move(player));

    launcher.wait();
    main_executor->wait();

    if(context.extract_frames == false)
    {
        counter.fill_streams_summary(context.pcap);
        context.updater->update_pcap_info(context.pcap.id, pcap_info::to_json(context.pcap));
    };
}
