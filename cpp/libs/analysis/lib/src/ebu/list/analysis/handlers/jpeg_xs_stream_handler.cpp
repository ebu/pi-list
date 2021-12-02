#include "ebu/list/analysis/handlers/jpeg_xs_stream_handler.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/st2110/d22/header.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d22;

jpeg_xs_stream_handler::jpeg_xs_stream_handler(rtp::packet first_packet, completion_handler ch)
    : completion_handler_(std::move(ch))
{
    /*logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));*/

    last_frame_ts_ = first_packet.info.rtp.view().timestamp();
}

void jpeg_xs_stream_handler::new_frame()
{
    current_frame_            = std::make_unique<frame_jpeg_xs>();
    current_frame_->timestamp = last_frame_ts_;

    this->on_frame_started(*current_frame_);
}

void jpeg_xs_stream_handler::detect_frame_transition(uint32_t timestamp)
{
    if(timestamp != last_frame_ts_)
    {
        // logger()->trace("new frame. ts = {}", timestamp);
        last_frame_ts_ = timestamp;

        frame_count_++;
        this->on_frame_complete(std::move(current_frame_));

        new_frame();
    }
}

void jpeg_xs_stream_handler::on_data(const rtp::packet& packet)
{
    if(!current_frame_) new_frame();

    const auto ts = packet.info.rtp.view().timestamp();
    detect_frame_transition(ts);

    parse_packet(packet); // todo: allow moving out of a packet
}

void jpeg_xs_stream_handler::on_complete()
{
    if(!current_frame_) return;

    ++frame_count_;
    this->on_frame_complete(std::move(current_frame_));

    completion_handler_(*this);
}

void jpeg_xs_stream_handler::on_error(std::exception_ptr)
{
}

// #define LIST_TRACE
void jpeg_xs_stream_handler::parse_packet(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    if(static_cast<size_t>(sdu.view().size()) < sizeof(uint32_t)) return;

    auto p = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();

    const auto payload_header = header(sdu);
    p += sizeof(payload_header);

    packet_jpeg_xs_info info{packet.info, packet, *current_frame_};


#if defined(LIST_TRACE)
    logger()->info("UDP packet size: {} SDU size: {}", packet.info.udp.datagram_size, sdu.view().size_bytes());
    logger()->info("Offset before header: {}", p - sdu.view().data());
#endif // defined(LIST_TRACE)

#if defined(LIST_TRACE)
    logger()->info("Offset after header: {}", p - sdu.view().data());

    const auto available_size = end - p;
    logger()->info("Available size: {}", available_size);
#endif // defined(LIST_TRACE)

    current_frame_->buffer.insert(current_frame_->buffer.end(), p, end);

    this->on_packet(info);
}
