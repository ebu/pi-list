#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/d21/frame_start_filter.h"
#include <vector>

namespace ebu_list::st2110::d21
{
    class rtp_ts_analyzer : public frame_start_filter::listener
    {
    public:
        struct packet_info
        {
            clock::time_point timestamp {};
            int64_t delta_rtp_vs_packet_time {};
            int64_t delta_rtp_vs_NTs {};
            std::optional<int> rtp_ts_delta {};
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
}
