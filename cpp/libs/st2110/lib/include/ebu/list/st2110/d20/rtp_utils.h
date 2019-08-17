#pragma once

#include "ebu/list/rtp/types.h"
#include "ebu/list/core/math.h"

namespace ebu_list::st2110::d20
{
    constexpr auto RTP_WRAP_AROUND = 0x100000000;
    constexpr auto RTP_CLOCK_RATE = 90000;

    uint32_t calculate_rtp_timestamp(fraction64 time);
    int64_t calculate_n(fraction64 packet_time, fraction64 frame_period);

    struct delta_info
    {
        rtp::ticks32 delta_rtp_vs_packet_time;
        rtp::ticks32 delta_rtp_vs_NTs;
        clock::duration delta_packet_time_vs_rtp_time;
    };

    delta_info calculate_rtp_to_packet_deltas(fraction64 frame_period, uint32_t rtp_timestamp, fraction64 packet_time);
} // namespace ebu_list::st2110::d20
