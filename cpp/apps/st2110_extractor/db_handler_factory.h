#pragma once

#include "cli_config.h"
#include "ebu/list/analysis/processing_context.h"
#include "ebu/list/database.h"

namespace ebu_list::st2110_extractor
{
    class db_handler_factory : public analysis::abstract_handler_factory
    {
      public:
        db_handler_factory(const config& c);
        st2110::d21::c_analyzer::listener_uptr create_c_inst_data_logger(const std::string& pcap_id,
                                                                         const std::string& stream_id) const override;
        histogram_listener_uptr create_c_inst_histogram_logger(const std::string& stream_id) const override;
        st2110::d20::rtp_ts_analyzer::listener_uptr create_rtp_ts_logger(const std::string& pcap_id,
                                                                         const std::string& stream_id) const override;
        st2110::d21::vrx_analyzer::listener_uptr create_vrx_data_logger(const std::string& pcap_id,
                                                                        const std::string& stream_id,
                                                                        const std::string& prefix) const override;
        histogram_listener_uptr create_vrx_histogram_logger(const std::string& stream_id) const override;
        analysis::audio_timing_analyser::listener_uptr
        create_audio_rtp_logger(const std::string& pcap_id, const std::string& stream_id,
                                const std::string& prefix) const override;
        analysis::audio_timing_analyser::listener_uptr
        create_audio_tsdf_logger(const std::string& pcap_id, const std::string& stream_id,
                                 const std::string& prefix) const override;
        analysis::anc_stream_handler::listener_uptr create_anc_rtp_logger(const std::string& pcap_id,
                                                                          const std::string& stream_id,
                                                                          const std::string& prefix) const override;
        histogram_listener_uptr create_anc_pkt_histogram_logger(const std::string& stream_id) const override;
        analysis::ttml::stream_handler::listener_uptr
        create_ttml_document_logger(const std::string& stream_id) const override;
        ptp::state_machine::listener_ptr create_ptp_logger(const std::string& pcap_id) const override;

      private:
        const config& config_;
    };

    class db_updater : public analysis::abstract_updater
    {
      public:
        db_updater(db_serializer& db, const path& storage_folder);
        void update_pcap_info(const std::string& pcap_id, const nlohmann::json& data) override;
        void update_stream_info(const std::string& id, const nlohmann::json& data) override;
        void update_sdp(const std::string& stream_id, const sdp::sdp_builder& sdp,
                        media::media_type media_type) override;

      private:
        db_serializer& db_;
        const path storage_folder_;
    };

} // namespace ebu_list::st2110_extractor
