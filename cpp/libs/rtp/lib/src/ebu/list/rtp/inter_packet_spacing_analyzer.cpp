#include "ebu/list/rtp/inter_packet_spacing_analyzer.h"
#include "ebu/list/rtp/decoder.h"

using namespace ebu_list;
using namespace ebu_list::rtp;
using namespace ebu_list::media;

//------------------------------------------------------------------------------

void update_item(uint64_t packet_count, inter_packet_spacing_t& item, clock::duration delta)
{
    if(packet_count == 1)
    {
        item.min = delta;
    }
    else
    {
        item.min = std::min(item.min, delta);
    }
    item.max = std::max(item.max, delta);
    item.avg = (item.avg * (packet_count - 1) + delta) / packet_count;
}

void inter_packet_spacing_analyzer::handle_data(const rtp::packet& packet)
{
    if(last_packet_timestamp_.has_value())
    {
        const auto delta = packet.info.udp.packet_time - *last_packet_timestamp_;

        if(last_packet_was_marked_)
        {
            ++marked_packet_count_;
            update_item(marked_packet_count_, info_.after_m_bit, delta);
        }
        else
        {
            ++regular_packet_count_;
            update_item(regular_packet_count_, info_.regular, delta);
        }
    }

    last_packet_timestamp_  = packet.info.udp.packet_time;
    last_packet_was_marked_ = packet.info.rtp().marker();
}

inter_packet_spacing_info_t inter_packet_spacing_analyzer::get_info() const noexcept
{
    return info_;
}
