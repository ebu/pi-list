#include "null_logger.h"

using namespace influxdb::api;
using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::influx;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace std;

//------------------------------------------------------------------------------

namespace
{
    constexpr auto pcap_stream_id = "ptp";
}

//------------------------------------------------------------------------------

null_ptp_logger::null_ptp_logger()
{
}

void null_ptp_logger::on_data(const data_type&)
{
}

void null_ptp_logger::on_complete()
{
}

void null_ptp_logger::on_error(std::exception_ptr)
{
}

//------------------------------------------------------------------------------

null_c_inst_logger::null_c_inst_logger()
{
}

void null_c_inst_logger::on_data(const c_analyzer::packet_info&)
{
}

void null_c_inst_logger::on_complete()
{
}

void null_c_inst_logger::on_error(std::exception_ptr)
{
}

//------------------------------------------------------------------------------

null_rtp_ts_logger::null_rtp_ts_logger()
{
}

void null_rtp_ts_logger::on_data(const rtp_ts_analyzer::packet_info&)
{
}

void null_rtp_ts_logger::on_complete()
{
}

void null_rtp_ts_logger::on_error(std::exception_ptr)
{
}

//------------------------------------------------------------------------------

null_rtp_logger::null_rtp_logger()
{
}

void null_rtp_logger::on_data(const rtp_analyzer::packet_info&)
{
}

void null_rtp_logger::on_complete()
{
}

void null_rtp_logger::on_error(std::exception_ptr)
{
}

//------------------------------------------------------------------------------

null_vrx_logger::null_vrx_logger()
{
}

void null_vrx_logger::on_data(const packet_info&)
{
}

void null_vrx_logger::on_complete()
{
}

void null_vrx_logger::on_error(std::exception_ptr)
{
}

//------------------------------------------------------------------------------

null_audio_rtp_logger::null_audio_rtp_logger()
{
}

void null_audio_rtp_logger::on_data(const audio_timing_analyser::delay_sample&)
{
}

void null_audio_rtp_logger::on_complete()
{
}

void null_audio_rtp_logger::on_error(std::exception_ptr)
{
}

//------------------------------------------------------------------------------

null_audio_tsdf_logger::null_audio_tsdf_logger()
{
}

void null_audio_tsdf_logger::on_data(const audio_timing_analyser::delay_sample&)
{
}

void null_audio_tsdf_logger::on_complete()
{
}

void null_audio_tsdf_logger::on_error(std::exception_ptr)
{
}
