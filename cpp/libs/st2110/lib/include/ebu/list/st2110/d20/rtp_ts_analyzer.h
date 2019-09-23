#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/types.h"
#include "ebu/list/st2110/frame_start_filter.h"
#include <vector>

namespace ebu_list::st2110::d20
{
    class rtp_ts_analyzer : public frame_start_filter::listener
    {
      public:
        struct packet_info
        {
            clock::time_point timestamp{};
            rtp::ticks32 delta_rtp_vs_packet_time{};
            rtp::ticks32 delta_rtp_vs_NTs{};
            std::optional<rtp::ticks32> rtp_ts_delta{};
            clock::duration delta_packet_time_vs_rtp_time{};
        };

        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(const packet_info&) = 0;
            virtual void on_complete() = 0;
            virtual void on_error(std::exception_ptr e) = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        rtp_ts_analyzer(listener_uptr listener, media::video::Rate rate);
        ~rtp_ts_analyzer();

        void on_data(const frame_start_filter::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110::d20
