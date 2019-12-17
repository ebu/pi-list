#pragma once

#include "ebu/list/analysis/handlers/anc_stream_handler.h"
#include "ebu/list/analysis/handlers/audio_timing_analyser.h"
#include "ebu/list/core/platform/time.h"
#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/d20/rtp_ts_analyzer.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/d21/vrx_analyzer.h"
#include <fstream>

namespace ebu_list::analysis
{
    class fs_ptp_logger : public ptp::state_machine::listener
    {
      public:
        fs_ptp_logger(std::string_view filename);

      private:
        void on_data(const data_type& info) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };

    class fs_c_inst_logger : public st2110::d21::c_analyzer::listener
    {
      public:
        fs_c_inst_logger(std::string_view filename);

      private:
        void on_data(const st2110::d21::c_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };

    class fs_rtp_ts_logger : public st2110::d20::rtp_ts_analyzer::listener
    {
      public:
        fs_rtp_ts_logger(std::string_view filename);

      private:
        void on_data(const st2110::d20::rtp_ts_analyzer::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };

    class fs_vrx_logger : public st2110::d21::vrx_analyzer::listener
    {
      public:
        fs_vrx_logger(std::string_view filename);

      private:
        void on_data(const st2110::d21::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };

    class fs_audio_rtp_logger : public audio_timing_analyser::listener
    {
      public:
        fs_audio_rtp_logger(std::string_view filename);

      private:
        void on_data(const audio_timing_analyser::delay_sample&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };

    class fs_audio_tsdf_logger : public audio_timing_analyser::listener
    {
      public:
        fs_audio_tsdf_logger(std::string_view filename);

      private:
        void on_data(const audio_timing_analyser::delay_sample&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };

    class fs_anc_rtp_logger : public anc_stream_handler::listener
    {
      public:
        fs_anc_rtp_logger(std::string_view filename);

      private:
        void on_data(const anc_stream_handler::frame_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        std::ofstream file_stream_;
    };
} // namespace ebu_list::analysis
