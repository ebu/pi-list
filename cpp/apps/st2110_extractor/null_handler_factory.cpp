#include "null_handler_factory.h"
#include "ebu/list/analysis/serialization/ttml_stream_serializer.h"
#include "ebu/list/analysis/serialization/video_stream_serializer.h"
#include "null_logger.h"

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
} // namespace

///////////////////////////////////////////////////////////////////////////////

null_handler_factory::null_handler_factory(const config& c) : config_(c)
{
}

st2110::d21::c_analyzer::listener_uptr null_handler_factory::create_c_inst_data_logger(const std::string&,
                                                                                       const std::string&) const
{
    return std::make_unique<influx::null_c_inst_logger>();
}

histogram_listener_uptr null_handler_factory::create_c_inst_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<histogram_writer>(info_path, cinst_file_name);
}

st2110::d20::rtp_ts_analyzer::listener_uptr null_handler_factory::create_rtp_ts_logger(const std::string&,
                                                                                       const std::string&) const
{
    return std::make_unique<influx::null_rtp_ts_logger>();
}

st2110::d20::rtp_analyzer::listener_uptr null_handler_factory::create_rtp_logger(const std::string&,
                                                                                 const std::string&) const
{
    return std::make_unique<influx::null_rtp_logger>();
}

st2110::d21::vrx_analyzer::listener_uptr
null_handler_factory::create_vrx_data_logger(const std::string&, const std::string&, const std::string&) const
{
    return std::make_unique<influx::null_vrx_logger>();
}

histogram_listener_uptr null_handler_factory::create_vrx_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<histogram_writer>(info_path, vrx_file_name);
}

audio_timing_analyser::listener_uptr
null_handler_factory::create_audio_rtp_logger(const std::string&, const std::string&, const std::string&) const
{
    return std::make_unique<influx::null_audio_rtp_logger>();
}

audio_timing_analyser::listener_uptr
null_handler_factory::create_audio_tsdf_logger(const std::string&, const std::string&, const std::string&) const
{
    return std::make_unique<influx::null_audio_tsdf_logger>();
}

histogram_listener_uptr null_handler_factory::create_pkt_histogram_logger(const std::string& stream_id) const
{
    const auto info_path = config_.storage_folder / stream_id;
    return std::make_unique<histogram_writer>(info_path, pkt_file_name);
}

ptp::state_machine::listener_ptr null_handler_factory::create_ptp_logger(const std::string&) const
{
    return std::make_shared<influx::null_ptp_logger>();
}

analysis::ttml::stream_handler::listener_uptr
null_handler_factory::create_ttml_document_logger(const std::string& stream_id) const
{
    return std::make_unique<analysis::ttml::stream_serializer>(config_.storage_folder, stream_id);
}
