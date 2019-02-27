#include "stream_handler.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/st2110/d20/packet.h"
#include "ebu/list/st2110/rate_calculator.h"
#include "ebu/list/core/memory/bimo.h"
using namespace ebu_list;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

stream_handler::stream_handler(rtp::packet first_packet)
{
    info_.source = source(first_packet.info.udp);
    info_.destination = destination(first_packet.info.udp);
    info_.ssrc = first_packet.info.rtp.view().ssrc();
    info_.first_frame_ts = first_packet.info.rtp.view().timestamp();
    info_.last_frame_ts = info_.first_frame_ts;

    logger()->info("created handler for {:08x}, {}->{}", info_.ssrc, to_string(info_.source), to_string(info_.destination));
}

const stream_info& stream_handler::info() const
{
    info_.rate = to_double(rate_.rate().value_or(media::video::Rate(0)));
    info_.packet_sizes = packet_sizes_.results();
    info_.ts_deltas = timestamp_deltas_.results();
    return info_;
}

void stream_handler::on_data(const rtp::packet& packet)
{
    ++info_.packet_count;
    info_.payload_type = packet.info.rtp.view().payload_type();

    packet_sizes_.add(packet.info.udp.datagram_size);

    const auto this_ts = packet.info.rtp.view().timestamp();

    if (last_ts_ && last_ts_.value() != this_ts)
    {
        timestamp_deltas_.add(this_ts - last_ts_.value());
    }

    last_ts_ = this_ts;

    const auto ts = packet.info.rtp.view().timestamp();
    if (ts < info_.first_frame_ts)
    {
        // TODO: detect rollover
        logger()->error("received packet of a past frame");
        return;
    }

    rate_.on_packet(ts);
}

void stream_handler::on_complete() 
{
}

void stream_handler::on_error(std::exception_ptr) 
{
}
