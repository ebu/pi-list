#include "ebu/list/st2110/d20/rtp_utils.h"

using namespace ebu_list;
using namespace ebu_list::rtp;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;

uint32_t d20::calculate_rtp_timestamp(fraction64 time)
{
    // TODO: this overflows if using fraction
    const auto t     = static_cast<double>(time) * RTP_CLOCK_RATE;
    const auto ticks = static_cast<int64_t>(round(t));
    return ticks % RTP_WRAP_AROUND;
}

int64_t d20::calculate_n(fraction64 packet_time, fraction64 frame_period)
{
    // TODO: without casting to double, this would overflow int64 calculations
    const auto n0 = static_cast<double>(packet_time) / static_cast<double>(frame_period);
    return static_cast<int64_t>(std::floor(n0));
}

delta_info d20::calculate_rtp_to_packet_deltas(fraction64 frame_period, uint32_t rtp_timestamp, fraction64 packet_time)
{
    delta_info info{};

    const auto n               = calculate_n(packet_time, frame_period);
    const auto base_frame_time = n * frame_period;

    const auto rtp_ts_for_packet_time = calculate_rtp_timestamp(packet_time);
    const auto rtp_ts_for_NTs         = calculate_rtp_timestamp(base_frame_time);

    const auto delta_t_ticks = static_cast<int>(rtp_ts_for_NTs) - static_cast<int>(rtp_timestamp);

    const auto n_ticks  = n * static_cast<double>(frame_period) * RTP_CLOCK_RATE;
    const auto tr_ticks = n_ticks - delta_t_ticks;
    const auto tr       = static_cast<double>(tr_ticks) / RTP_CLOCK_RATE;

    const auto delta_packet_time_vs_rtp_time    = static_cast<double>(packet_time) - tr;
    const auto delta_packet_time_vs_rtp_time_ns = std::giga::num * delta_packet_time_vs_rtp_time;

    info.delta_packet_time_vs_rtp_time = std::chrono::nanoseconds(std::llround(delta_packet_time_vs_rtp_time_ns));

    info.delta_rtp_vs_packet_time =
        to_ticks32(static_cast<int>(rtp_timestamp) - static_cast<int>(rtp_ts_for_packet_time));
    info.delta_rtp_vs_NTs = to_ticks32(static_cast<int>(rtp_timestamp) - static_cast<int>(rtp_ts_for_NTs));

    return info;
}
