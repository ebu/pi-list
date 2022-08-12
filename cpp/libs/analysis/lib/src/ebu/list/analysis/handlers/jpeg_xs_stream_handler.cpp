#include "ebu/list/analysis/handlers/jpeg_xs_stream_handler.h"
#include "ebu/list/analysis/handlers/video_stream_handler.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/st2110/d22/header.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d22;

jpeg_xs_stream_handler::jpeg_xs_stream_handler(rtp::packet first_packet, serializable_stream_info info,
                                               video_stream_details details, completion_handler ch)
    : info_(std::move(info)), video_description_(std::move(details)), completion_handler_(std::move(ch))
{
    /*logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));*/

    video_description_.first_frame_ts  = first_packet.info.rtp.view().timestamp();
    video_description_.last_frame_ts   = video_description_.first_frame_ts;
    video_description_.first_packet_ts = first_packet.info.udp.packet_time;
    update_net_info_with_address_validation(info_.network, first_packet.info);

    info_.network.has_extended_header = first_packet.info.rtp.view().extension();
    info_.network.dscp                = info.network.dscp;
    info_.state                       = stream_state::ON_GOING_ANALYSIS; // mark as analysis started
}

void jpeg_xs_stream_handler::new_frame()
{
    current_frame_            = std::make_unique<frame_jpeg_xs>();
    current_frame_->timestamp = video_description_.last_frame_ts;

    this->on_frame_started(*current_frame_);
}

void jpeg_xs_stream_handler::detect_frame_transition(uint32_t timestamp)
{
    if(timestamp != video_description_.last_frame_ts)
    {
        // logger()->trace("new frame. ts = {}", timestamp);
        video_description_.last_frame_ts = timestamp;

        video_description_.frame_count++;
        this->on_frame_complete(std::move(current_frame_));

        new_frame();
    }
}

void jpeg_xs_stream_handler::on_data(const rtp::packet& packet)
{
    if(!current_frame_) new_frame();

    update_net_info_with_address_validation(info_.network, packet.info);
    inter_packet_spacing_.handle_data(packet);

    video_description_.last_packet_ts = packet.info.udp.packet_time;
    const auto ts                     = packet.info.rtp.view().timestamp();
    detect_frame_transition(ts);

    parse_packet(packet); // todo: allow moving out of a packet
    rate_.on_packet(ts);
}

void jpeg_xs_stream_handler::on_complete()
{
    if(!current_frame_) return;

    info_.network.inter_packet_spacing_info = inter_packet_spacing_.get_info();
    ++video_description_.frame_count;
    this->on_frame_complete(std::move(current_frame_));

    info_.state = stream_state::ANALYZED;
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

    auto p         = sdu.view().data();
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

const serializable_stream_info& jpeg_xs_stream_handler::network_info() const
{
    return info_;
}

const video_stream_details& jpeg_xs_stream_handler::info() const
{
    video_description_.video.rate = rate_.rate().value_or(media::video::Rate(0));
    return video_description_;
}
