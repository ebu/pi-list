#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/srt/srt_decoder.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::srt;


srt_decoder::srt_decoder(udp::datagram first_datagram, completion_handler ch)
    : completion_handler_(std::move(ch))
{
    /*logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));*/

    auto& sdu = first_datagram.sdu;
    // Verify packet payload header to see if matches payload header of srt packet
    if(static_cast<size_t>(sdu.view().size()) < sizeof(uint32_t))
    {
        logger()->error("Packet size smaller than minimum: {}", sdu.view().size());

    }
    auto payload_header = header(sdu);

    auto timestamp = payload_header.get_timestamp();

    last_frame_ts_ = timestamp;
}

void srt_decoder::new_frame()
{


    current_frame_            = std::make_unique<frame_srt>();
    current_frame_->timestamp = last_frame_ts_;

    this->on_frame_started(*current_frame_);
}

void srt_decoder::detect_frame_transition(uint32_t timestamp)
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

void srt_decoder::on_data(const udp::datagram& datagram)
{
    if(!current_frame_) new_frame();

    auto& sdu = datagram.sdu;
    // Verify packet payload header to see if matches payload header of srt packet
    if(static_cast<size_t>(sdu.view().size()) < sizeof(uint32_t))
    {
        logger()->error("Packet size smaller than minimum: {}", sdu.view().size());

    }
    auto payload_header = header(sdu);

    auto timestamp = payload_header.get_timestamp();

    detect_frame_transition(timestamp);

    parse_packet(datagram); // todo: allow moving out of a packet
}

void srt_decoder::on_complete()
{
    if(!current_frame_) return;

    ++frame_count_;
    this->on_frame_complete(std::move(current_frame_));

    completion_handler_(*this);
}

void srt_decoder::on_error(std::exception_ptr)
{
}

// #define LIST_TRACE
void srt_decoder::parse_packet(const udp::datagram& datagram)
{
    auto& sdu = datagram.sdu;

    if(static_cast<size_t>(sdu.view().size()) < sizeof(uint32_t)) return;

    auto p         = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();

    const auto payload_header = header(sdu);
    p += sizeof(payload_header);

    packet_srt_info info{datagram.info, datagram, *current_frame_};

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
