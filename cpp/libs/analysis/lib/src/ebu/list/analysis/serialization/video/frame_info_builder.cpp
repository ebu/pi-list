#include "ebu/list/analysis/serialization/video/frame_info_builder.h"
using namespace ebu_list::analysis;

void frame_info_builder::on_packet(const packet_info& p) noexcept
{
    ++packet_count_;
    const auto t =
        std::chrono::duration_cast<std::chrono::nanoseconds>(p.rtp.udp.packet_time.time_since_epoch()).count();

    if(!first_packet_timestamp_.has_value())
    {
        first_packet_timestamp_ = t;
    }

    last_packet_timestamp_ = t;
}

void frame_info_builder::reset() noexcept
{
    packet_count_           = 0;
    first_packet_timestamp_ = 0;
    last_packet_timestamp_  = 0;
}

size_t frame_info_builder::get_packet_count() const noexcept
{
    return packet_count_;
}

int64_t frame_info_builder::get_first_packet_timestamp() const noexcept
{
    return first_packet_timestamp_.value_or(0);
    ;
}

int64_t frame_info_builder::get_last_packet_timestamp() const noexcept
{
    return last_packet_timestamp_;
}
