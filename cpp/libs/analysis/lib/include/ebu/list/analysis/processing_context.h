#pragma once

#include "analysis_profile.h"
#include "ebu/list/analysis/handlers/anc_stream_handler.h"
#include "ebu/list/analysis/handlers/audio_timing_analyser.h"
#include "ebu/list/analysis/handlers/troffset_calculator.h"
#include "ebu/list/analysis/serialization/pcap.h"
#include "ebu/list/analysis/serialization/serialization.h"
#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/sdp/sdp_builder.h"
#include "ebu/list/st2110/d20/rtp_ts_analyzer.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/st2110/d21/vrx_analyzer.h"
#include "nlohmann/json.hpp"

namespace ebu_list::analysis
{
    class abstract_handler_factory
    {
      public:
        virtual ~abstract_handler_factory() = default;

        virtual st2110::d21::c_analyzer::listener_uptr
        create_c_inst_data_logger(const std::string& pcap_id, const std::string& stream_id) const          = 0;
        virtual histogram_listener_uptr create_c_inst_histogram_logger(const std::string& stream_id) const = 0;
        virtual st2110::d20::rtp_ts_analyzer::listener_uptr
        create_rtp_ts_logger(const std::string& pcap_id, const std::string& stream_id) const                     = 0;
        virtual st2110::d21::vrx_analyzer::listener_uptr create_vrx_data_logger(const std::string& pcap_id,
                                                                                const std::string& stream_id,
                                                                                const std::string& prefix) const = 0;
        virtual histogram_listener_uptr create_vrx_histogram_logger(const std::string& stream_id) const          = 0;
        virtual audio_timing_analyser::listener_uptr create_audio_rtp_logger(const std::string& pcap_id,
                                                                             const std::string& stream_id,
                                                                             const std::string& prefix) const    = 0;
        virtual audio_timing_analyser::listener_uptr create_audio_tsdf_logger(const std::string& pcap_id,
                                                                              const std::string& stream_id,
                                                                              const std::string& prefix) const   = 0;
        virtual anc_stream_handler::listener_uptr create_anc_rtp_logger(const std::string& pcap_id,
                                                                        const std::string& stream_id,
                                                                        const std::string& prefix) const         = 0;
        virtual histogram_listener_uptr create_anc_pkt_histogram_logger(const std::string& stream_id) const      = 0;
        virtual ptp::state_machine::listener_ptr create_ptp_logger(const std::string& pcap_id) const             = 0;
    };

    using abstract_handler_factory_uptr = std::unique_ptr<abstract_handler_factory>;

    class abstract_updater
    {
      public:
        virtual ~abstract_updater() = default;

        virtual void update_pcap_info(const std::string& pcap_id, const nlohmann::json& data) = 0;
        virtual void update_stream_info(const std::string& id, const nlohmann::json& data)    = 0;
        virtual void update_sdp(const std::string& stream_id, const sdp::sdp_builder& sdp,
                                media::media_type media_type)                                 = 0;
    };

    struct processing_context
    {
        path pcap_file;
        const analysis_profile profile;
        path storage_folder;
        pcap_info& pcap;
        std::function<std::optional<stream_with_details>(const rtp::packet& first_packet)> get_stream_info;
        abstract_handler_factory const* const handler_factory;
        abstract_updater* const updater;
    };
} // namespace ebu_list::analysis
