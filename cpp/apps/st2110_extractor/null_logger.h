#pragma once

#include "ebu/list/analysis/handlers/audio_timing_analyser.h"
#include "ebu/list/core/platform/time.h"
#include "ebu/list/influxdb.h"
#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/types.h"
#include "ebu/list/st2110/d20/rtp_analyzer.h"
#include "ebu/list/st2110/d20/rtp_ts_analyzer.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/d21/vrx_analyzer.h"

namespace ebu_list::influx
{
    class null_ptp_logger : public ptp::state_machine::listener
    {
      public:
        null_ptp_logger();

      private:
        void on_data(const data_type& info) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;
    };

    class null_c_inst_logger : public st2110::d21::c_analyzer::listener
    {
      public:
        null_c_inst_logger();

      private:
        void on_data(const st2110::d21::c_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    };

    class null_rtp_ts_logger : public st2110::d20::rtp_ts_analyzer::listener
    {
      public:
        null_rtp_ts_logger();

      private:
        void on_data(const st2110::d20::rtp_ts_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    };

    class null_rtp_logger : public st2110::d20::rtp_analyzer::listener
    {
      public:
        null_rtp_logger();

      private:
        void on_data(const st2110::d20::rtp_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    };

    class null_vrx_logger : public st2110::d21::vrx_analyzer::listener
    {
      public:
        null_vrx_logger();

      private:
        void on_data(const st2110::d21::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;
    };

    class null_audio_rtp_logger : public analysis::audio_timing_analyser::listener
    {
      public:
        null_audio_rtp_logger();

      private:
        void on_data(const analysis::audio_timing_analyser::delay_sample&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;
    };

    class null_audio_tsdf_logger : public analysis::audio_timing_analyser::listener
    {
      public:
        null_audio_tsdf_logger();

      private:
        void on_data(const analysis::audio_timing_analyser::delay_sample&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;
    };
} // namespace ebu_list::influx
