#pragma once

#include "ebu/list/rtp/decoder.h"
#include "ebu/list/core/media/video_description.h"

namespace ebu_list::st2110::d21
{
    class c_calculator
    {
    public:
        c_calculator(int64_t npackets, media::video::Rate rate);
        int on_packet(const clock::time_point& packet_time);

    private:
        const int64_t npackets_; // Number of packets per frame
        const fraction64 tframe_; // Period of a frame, in seconds
        const fraction64 t_drain_ns_; // Cinst time between draining two packets, in ns
        int last_cinst_ = 0;
        std::vector<int> cleared_; // Amount of packets cleared out of the buffer
        std::optional<int64_t> initial_time_;
    };
}
