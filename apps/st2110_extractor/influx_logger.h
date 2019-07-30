#pragma once

#include "ebu/list/core/platform/time.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/st2110/d21/rtp_ts_analyzer.h"
#include "ebu/list/st2110/d21/vrx_analyzer.h"
#include "ebu/list/influxdb.h"
#include "ebu/list/handlers/audio_timing_analyser.h"

using namespace ebu_list;

namespace ebu_list::influx
{
    class influxdb_ptp_logger : public ptp::state_machine::listener
    {
    public:
        influxdb_ptp_logger(std::string_view url, std::string_view pcap_id);

    private:
        void on_data(const data_type& info) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        base_influx_logger db_;
    };

    class influxdb_c_inst_logger : public st2110::d21::c_analyzer::listener
    {
    public:
        influxdb_c_inst_logger(std::string_view url, std::string_view pcap_id, std::string_view stream_id);

    private:
        // calculator::listener
        void on_data(const st2110::d21::c_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        base_influx_logger db_;
    };

    class influxdb_rtp_ts_logger : public st2110::d21::rtp_ts_analyzer::listener
    {
    public:
        influxdb_rtp_ts_logger(std::string_view url, std::string_view pcap_id, std::string_view stream_id);

    private:
        // calculator::listener
        void on_data(const st2110::d21::rtp_ts_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        base_influx_logger db_;
    };

    class influxdb_vrx_logger : public st2110::d21::vrx_analyzer::listener
    {
    public:
        influxdb_vrx_logger(std::string_view url, std::string_view pcap_id, std::string_view stream_id, std::string prefix);

    private:
        // calculator::listener
        void on_data(const st2110::d21::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        base_influx_logger db_;
        const std::string prefix_;
    };

    class influxdb_audio_timing_logger : public ebu_list::audio_timing_analyser::listener
    {
    public:
        influxdb_audio_timing_logger(std::string_view url, std::string_view pcap_id, std::string_view stream_id, std::string prefix);

    private:
        // calculator::listener
        void on_data(const ebu_list::audio_timing_analyser::delay_sample&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        base_influx_logger db_;
        const std::string prefix_;
    };
}
