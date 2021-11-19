#include "db_handler_factory.h"
#include "ebu/list/analysis/serialization/ttml_stream_serializer.h"
#include "ebu/list/analysis/serialization/video_stream_serializer.h"
#include "influx_logger.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::st2110_extractor;

namespace
{
    constexpr auto cinst_file_name = "cinst.json";
    constexpr auto vrx_file_name   = "vrx.json";
    constexpr auto pkt_file_name   = "pkt_hist.json";
    constexpr auto pit_file_name = "pit.json";
} // namespace

///////////////////////////////////////////////////////////////////////////////

db_handler_factory::db_handler_factory(const config& c) : config_(c)
{
}

st2110::d21::c_analyzer::listener_uptr db_handler_factory::create_c_inst_data_logger(const std::string& pcap_id,
                                                                              const std::string& stream_id) const
{
    return std::make_unique<influx::influxdb_c_inst_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL), pcap_id,
                                                            stream_id);
}

histogram_listener_uptr db_handler_factory::create_c_inst_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<histogram_writer>(info_path, cinst_file_name);
}
//Add pit histogram logger
st2110::d22::packet_interval_time_analyzer::listener_uptr db_handler_factory::create_pit_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<pit_writer>(info_path, pit_file_name);
}

st2110::d20::rtp_ts_analyzer::listener_uptr db_handler_factory::create_rtp_ts_logger(const std::string& pcap_id,
                                                                              const std::string& stream_id) const
{
    return std::make_unique<influx::influxdb_rtp_ts_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL), pcap_id,
                                                            stream_id);
}

st2110::d20::rtp_analyzer::listener_uptr db_handler_factory::create_rtp_logger(const std::string& pcap_id,
                                                                        const std::string& stream_id) const
{
    return std::make_unique<influx::influxdb_rtp_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL), pcap_id,
                                                         stream_id);
}

st2110::d21::vrx_analyzer::listener_uptr db_handler_factory::create_vrx_data_logger(const std::string& pcap_id,
                                                                             const std::string& stream_id,
                                                                             const std::string& prefix) const
{
    return std::make_unique<influx::influxdb_vrx_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL), pcap_id,
                                                         stream_id, prefix);
}

histogram_listener_uptr db_handler_factory::create_vrx_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<histogram_writer>(info_path, vrx_file_name);
}

audio_timing_analyser::listener_uptr db_handler_factory::create_audio_rtp_logger(const std::string& pcap_id,
                                                                          const std::string& stream_id,
                                                                          const std::string& prefix) const
{
    return std::make_unique<influx::influxdb_audio_rtp_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL),
                                                               pcap_id, stream_id, prefix);
}

audio_timing_analyser::listener_uptr db_handler_factory::create_audio_tsdf_logger(const std::string& pcap_id,
                                                                           const std::string& stream_id,
                                                                           const std::string& prefix) const
{
    return std::make_unique<influx::influxdb_audio_tsdf_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL),
                                                                pcap_id, stream_id, prefix);
}

histogram_listener_uptr db_handler_factory::create_pkt_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<histogram_writer>(info_path, pkt_file_name);
}

ptp::state_machine::listener_ptr db_handler_factory::create_ptp_logger(const std::string& pcap_id) const
{
    if(config_.influxdb_url)
    {
        return std::make_shared<influx::influxdb_ptp_logger>(config_.influxdb_url.value_or(INFLUX_DEFAULT_URL),
                                                             pcap_id);
    }
    else
    {
        return std::make_shared<ptp::null_state_machine_listener>();
    }
}

analysis::ttml::stream_handler::listener_uptr
db_handler_factory::create_ttml_document_logger(const std::string& stream_id) const
{
    return std::make_unique<analysis::ttml::stream_serializer>(config_.storage_folder, stream_id);
}

db_updater::db_updater(db_serializer& db, const path& storage_folder) : db_(db), storage_folder_(storage_folder)
{
}

void db_updater::update_pcap_info(const std::string& pcap_id, const nlohmann::json& data)
{
    const auto look_for = nlohmann::json{{"id", pcap_id}};
    db_.update(constants::db::offline, constants::db::collections::pcaps, look_for, data);
}

void db_updater::update_stream_info(const std::string& id, const nlohmann::json& data)
{
    const auto stream_to_update = nlohmann::json{{"id", id}};
    db_.update(constants::db::offline, constants::db::collections::streams, stream_to_update, data);
}

void db_updater::update_sdp(const std::string& stream_id, const sdp::sdp_builder& sdp, media::media_type media_type)
{
    write_to(sdp, storage_folder_ / stream_id / (to_string(media_type) + ".sdp"));
}
