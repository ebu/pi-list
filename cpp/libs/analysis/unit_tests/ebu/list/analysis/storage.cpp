#include "storage.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::analysis;

fs_ptp_logger::fs_ptp_logger(std::string_view filename) : file_stream_(filename.data())
{
}

void fs_ptp_logger::on_data(const data_type& info)
{
    const auto offset = std::chrono::duration_cast<std::chrono::nanoseconds>(info.offset_from_master).count();
    file_stream_ << offset << " " << ebu_list::to_date_time_string(info.sync_message_timestamp) << std::endl;
}

void fs_ptp_logger::on_complete()
{
    file_stream_.close();
}

void fs_ptp_logger::on_error(std::exception_ptr)
{
}

fs_c_inst_logger::fs_c_inst_logger(std::string_view filename) : file_stream_(filename.data())
{
}

void fs_c_inst_logger::on_data(const c_analyzer::packet_info& info)
{
    file_stream_ << info.cinst << " " << ebu_list::to_date_time_string(info.packet_time) << std::endl;
}

void fs_c_inst_logger::on_complete()
{
    file_stream_.close();
}

void fs_c_inst_logger::on_error(std::exception_ptr)
{
}

fs_rtp_ts_logger::fs_rtp_ts_logger(std::string_view filename) : file_stream_(filename.data())
{
}

void fs_rtp_ts_logger::on_data(const rtp_ts_analyzer::packet_info& info)
{
    file_stream_ << from_ticks(info.delta_rtp_vs_NTs) << " " << ebu_list::to_date_time_string(info.timestamp)
                 << std::endl;
    file_stream_ << from_ticks(info.delta_rtp_vs_packet_time) << " " << ebu_list::to_date_time_string(info.timestamp)
                 << std::endl;
    file_stream_ << info.delta_packet_time_vs_rtp_time.count() << " " << ebu_list::to_date_time_string(info.timestamp)
                 << std::endl;
    file_stream_ << from_ticks(info.rtp_ts_delta).value_or(0) << " " << ebu_list::to_date_time_string(info.timestamp)
                 << std::endl;
}

void fs_rtp_ts_logger::on_complete()
{
    file_stream_.close();
}

void fs_rtp_ts_logger::on_error(std::exception_ptr)
{
}

fs_vrx_logger::fs_vrx_logger(std::string_view filename) : file_stream_(filename.data())
{
}

void fs_vrx_logger::on_data(const packet_info& fd)
{
    file_stream_ << fd.vrx << " " << ebu_list::to_date_time_string(fd.packet_time) << std::endl;
    file_stream_ << fd.delta_to_ideal_tpr0.value_or(0.0) << " " << ebu_list::to_date_time_string(fd.packet_time)
                 << std::endl;
}

void fs_vrx_logger::on_complete()
{
    file_stream_.close();
}

void fs_vrx_logger::on_error(std::exception_ptr)
{
}

fs_audio_rtp_logger::fs_audio_rtp_logger(std::string_view filename) : file_stream_(filename.data())
{
}

void fs_audio_rtp_logger::on_data(const audio_timing_analyser::delay_sample& sample)
{
    file_stream_ << sample.pkt_ts_vs_rtp_ts << " " << to_date_time_string(sample.timestamp) << std::endl;
}

void fs_audio_rtp_logger::on_complete()
{
    file_stream_.close();
}

void fs_audio_rtp_logger::on_error(std::exception_ptr)
{
}

fs_audio_tsdf_logger::fs_audio_tsdf_logger(std::string_view filename) : file_stream_(filename.data())
{
}

void fs_audio_tsdf_logger::on_data(const audio_timing_analyser::delay_sample& sample)
{
    file_stream_ << sample.time_stamped_delay_factor << " " << to_date_time_string(sample.timestamp) << std::endl;
}

void fs_audio_tsdf_logger::on_complete()
{
    file_stream_.close();
}

void fs_audio_tsdf_logger::on_error(std::exception_ptr)
{
}
