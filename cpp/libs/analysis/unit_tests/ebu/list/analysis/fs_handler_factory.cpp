#include "fs_handler_factory.h"
#include "ebu/list/analysis/handlers/ttml_stream_handler.h"
#include "ebu/list/analysis/serialization/ttml_stream_serializer.h"
#include "ebu/list/analysis/serialization/utils.h"
#include "ebu/list/analysis/serialization/video_stream_serializer.h"
#include "storage.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::analysis;

namespace
{
    constexpr auto pcap_file_name    = "pcap.json";
    constexpr auto stream_file_name  = "stream.json";
    constexpr auto cinst_file_name   = "cinst.json";
    constexpr auto vrx_file_name     = "vrx.json";
    constexpr auto ptp_log_file      = "ptp_log.txt";
    constexpr auto c_inst_log_file   = "c_inst_log.txt";
    constexpr auto rtp_ts_log_file   = "rtp_ts_log.txt";
    constexpr auto vrx_log_file      = "vrx_log.txt";
    constexpr auto rtp_log_file      = "rtp_log.txt";
    constexpr auto audio_rtp_log_file= "rtp_log.txt";
    constexpr auto tsdf_log_file     = "tsdf_log.txt";
    constexpr auto pkt_hist_file_name= "pkt_hist.json";
} // namespace

fs_handler_factory::fs_handler_factory(const path& storage_base_dir) : storage_base_dir_(storage_base_dir)
{
}

st2110::d21::c_analyzer::listener_uptr fs_handler_factory::create_c_inst_data_logger(const std::string& pcap_id,
                                                                                     const std::string& stream_id) const
{
    return std::make_unique<fs_c_inst_logger>((storage_base_dir_ / pcap_id / stream_id / c_inst_log_file).string());
}

histogram_listener_uptr fs_handler_factory::create_c_inst_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = storage_base_dir_ / stream_id;
    return std::make_unique<histogram_writer>(info_path, cinst_file_name);
}

st2110::d20::rtp_ts_analyzer::listener_uptr fs_handler_factory::create_rtp_ts_logger(const std::string& pcap_id,
                                                                                     const std::string& stream_id) const
{
    return std::make_unique<fs_rtp_ts_logger>((storage_base_dir_ / pcap_id / stream_id / rtp_ts_log_file).string());
}

st2110::d20::rtp_analyzer::listener_uptr fs_handler_factory::create_rtp_logger(const std::string& pcap_id,
                                                                                     const std::string& stream_id) const
{
    return std::make_unique<fs_rtp_logger>((storage_base_dir_ / pcap_id / stream_id / rtp_log_file).string());
}

st2110::d21::vrx_analyzer::listener_uptr fs_handler_factory::create_vrx_data_logger(const std::string& pcap_id,
                                                                                    const std::string& stream_id,
                                                                                    const std::string& prefix) const
{
    return std::make_unique<fs_vrx_logger>((storage_base_dir_ / pcap_id / stream_id / prefix / vrx_log_file).string());
}

histogram_listener_uptr fs_handler_factory::create_vrx_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = storage_base_dir_ / stream_id;
    return std::make_unique<histogram_writer>(info_path, vrx_file_name);
}

audio_timing_analyser::listener_uptr fs_handler_factory::create_audio_rtp_logger(const std::string& pcap_id,
                                                                                 const std::string& stream_id,
                                                                                 const std::string& prefix) const
{
    return std::make_unique<fs_audio_rtp_logger>(
        (storage_base_dir_ / pcap_id / stream_id / prefix / audio_rtp_log_file).string());
}

audio_timing_analyser::listener_uptr fs_handler_factory::create_audio_tsdf_logger(const std::string& pcap_id,
                                                                                  const std::string& stream_id,
                                                                                  const std::string& prefix) const
{
    return std::make_unique<fs_audio_tsdf_logger>(
        (storage_base_dir_ / pcap_id / stream_id / prefix / tsdf_log_file).string());
}

histogram_listener_uptr fs_handler_factory::create_pkt_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = storage_base_dir_ / stream_id;
    return std::make_unique<histogram_writer>(info_path, pkt_hist_file_name);
}

analysis::ttml::stream_handler::listener_uptr
fs_handler_factory::create_ttml_document_logger(const std::string& stream_id) const
{
    return std::make_unique<analysis::ttml::stream_serializer>(storage_base_dir_, stream_id);
}

ptp::state_machine::listener_ptr fs_handler_factory::create_ptp_logger(const std::string& pcap_id) const
{
    return std::make_shared<fs_ptp_logger>((storage_base_dir_ / pcap_id / ptp_log_file).string());
}

fs_updater::fs_updater(const path& storage_base_dir) : storage_base_dir_(storage_base_dir)
{
}

void fs_updater::update_pcap_info(const std::string& pcap_id, const nlohmann::json& data)
{
    write_json_to(storage_base_dir_ / pcap_id, pcap_file_name, data);
}

void fs_updater::update_stream_info(const std::string& id, const nlohmann::json& data)
{
    write_json_to(storage_base_dir_ / id, stream_file_name, data);
}

void fs_updater::update_sdp(const std::string& stream_id, const sdp::sdp_builder& sdp, media::media_type media_type)
{
    write_to(sdp, storage_base_dir_ / stream_id / (to_string(media_type) + ".sdp"));
}
