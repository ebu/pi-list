#pragma once

#include "ebu/list/analysis/processing_context.h"

namespace ebu_list::analysis
{
    class fs_handler_factory : public abstract_handler_factory
    {
      public:
        fs_handler_factory(const path& storage_base_dir);

        st2110::d21::c_analyzer::listener_uptr create_c_inst_data_logger(const std::string& pcap_id,
                                                                         const std::string& stream_id) const override;
        histogram_listener_uptr create_c_inst_histogram_logger(const std::string& stream_id) const override;
        histogram_listener_uptr create_pit_histogram_logger(const std::string& stream_id) const override;
        st2110::d20::rtp_ts_analyzer::listener_uptr create_rtp_ts_logger(const std::string& pcap_id,
                                                                         const std::string& stream_id) const override;
        st2110::d20::rtp_analyzer::listener_uptr create_rtp_logger(const std::string& pcap_id,
                                                                   const std::string& stream_id) const override;
        st2110::d21::vrx_analyzer::listener_uptr create_vrx_data_logger(const std::string& pcap_id,
                                                                        const std::string& stream_id,
                                                                        const std::string& prefix) const override;
        histogram_listener_uptr create_vrx_histogram_logger(const std::string& stream_id) const override;
        audio_timing_analyser::listener_uptr create_audio_rtp_logger(const std::string& pcap_id,
                                                                     const std::string& stream_id,
                                                                     const std::string& prefix) const override;
        audio_timing_analyser::listener_uptr create_audio_tsdf_logger(const std::string& pcap_id,
                                                                      const std::string& stream_id,
                                                                      const std::string& prefix) const override;
        histogram_listener_uptr create_pkt_histogram_logger(const std::string& stream_id) const override;
        ttml::stream_handler::listener_uptr create_ttml_document_logger(const std::string& stream_id) const override;
        ptp::state_machine::listener_ptr create_ptp_logger(const std::string& pcap_id) const override;

      private:
        const path storage_base_dir_;
    };

    class fs_updater : public abstract_updater
    {
      public:
        fs_updater(const path& storage_base_dir);
        void update_pcap_info(const std::string& pcap_id, const nlohmann::json& data) override;
        void update_stream_info(const std::string& id, const nlohmann::json& data) override;
        void update_sdp(const std::string& stream_id, const sdp::sdp_builder& sdp,
                        media::media_type media_type) override;

      private:
        const path storage_base_dir_;
    };
} // namespace ebu_list::analysis
