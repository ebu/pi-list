#include "ebu/list/analysis/handlers/jpeg_xs_stream_handler.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/st2110/d20/packet.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d20;

jpeg_xs_stream_handler::jpeg_xs_stream_handler(rtp::packet first_packet,
                                           serializable_stream_info info,
                                           completion_handler ch)
    : info_(std::move(info)), completion_handler_(std::move(ch))
{
    logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));

    video_description_.first_frame_ts  = first_packet.info.rtp.view().timestamp();
    video_description_.last_frame_ts   = video_description_.first_frame_ts;
    video_description_.first_packet_ts = first_packet.info.udp.packet_time;

    info_.network.has_extended_header = first_packet.info.rtp.view().extension();

    info_.state = stream_state::ON_GOING_ANALYSIS; // mark as analysis started
}

void jpeg_xs_stream_handler::new_frame()
{
    current_frame_            = std::make_unique<frame>();


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

    inter_packet_spacing_.handle_data(packet);

    const auto ts                     = packet.info.rtp.view().timestamp();
    detect_frame_transition(ts);

    parse_packet(packet); // todo: allow moving out of a packet

    rate_.on_packet(ts);
}

void jpeg_xs_stream_handler::on_complete()
{
    if(!current_frame_) return;

    info_.network.dscp                      = dscp_.get_info();
    info_.network.inter_packet_spacing_info = inter_packet_spacing_.get_info();

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
    if(packet.info.rtp.view().extension())
    {
        info_.network.has_extended_header = true;
    }

    auto& sdu = packet.sdu;

    constexpr auto minimum_size = ssizeof<raw_extended_sequence_number>() + ssizeof<raw_line_header>();
    if(sdu.view().size() < minimum_size) return;

    auto p = sdu.view().data();

    const auto extended_sequence_number = to_native(reinterpret_cast<const raw_extended_sequence_number*>(p)->esn);
    const uint32_t full_sequence_number = (extended_sequence_number << 16) | packet.info.rtp.view().sequence_number();

    // skip esn
    p += sizeof(raw_extended_sequence_number);

    packet_info info{packet.info, packet, *current_frame_, full_sequence_number, {}};

    size_t line_index = 0;

#if defined(LIST_TRACE)
    logger()->info("UDP packet size: {} SDU size: {}", packet.info.udp.datagram_size, sdu.view().size_bytes());
    logger()->info("Offset before header: {}", p - sdu.view().data());
#endif // defined(LIST_TRACE)

    const auto end = sdu.view().data() + sdu.view().size();

    while(p < end)
    {
        const auto line_header = line_header_lens(*reinterpret_cast<const raw_line_header*>(p));
        p += sizeof(raw_line_header);


        LIST_ENFORCE(line_index < info.line_info.size(), std::runtime_error,
                     "Only three lines per packet allowed by ST2110-20");

        info.line_info[line_index].continuation         = line_header.continuation();
        info.line_info[line_index].field_identification = line_header.field_identification();
        info.line_info[line_index].length               = line_header.length();
        info.line_info[line_index].line_number          = line_header.line_number();
        info.line_info[line_index].offset               = line_header.offset();
        info.line_info[line_index].valid                = true;


#if defined(LIST_TRACE)
        logger()->info("Line in packet: {} Line no: {} Offset: {} Length: {}", line_index,
                       info.line_info[line_index].line_number, info.line_info[line_index].offset,
                       info.line_info[line_index].length);
#endif // defined(LIST_TRACE)

        ++line_index;
        if(!line_header.continuation()) break;
    }

#if defined(LIST_TRACE)
    logger()->info("Offset after header: {}", p - sdu.view().data());

    const auto available_size = end - p;
    logger()->info("Available size: {}", available_size);
#endif // defined(LIST_TRACE)

    const auto sample_row_data_length = end - p;
    pm_analyzer_.on_data(sample_row_data_length, packet.info.rtp.view().marker());

    if(should_decode_video_)
    {
        for(const auto& line : info.line_info)
        {
            if(!line.valid) break;

            if(p + line.length > end)
            {
                // TODO: report this
                logger()->error("buf7y{} Length: {}", line.line_number,
                                line.offset, line.length);
                break;
            }

            const auto byte_offset = offset_to_byte_offset(line.offset, video_description_.video);

            const auto target = current_frame_->buffer->begin() +
                                get_line_size_bytes(video_description_.video) * line.line_number + byte_offset;
            if(target + line.length > current_frame_->buffer->end())
            {
                // TODO: report this
                logger()->error("buffer out of bounds. Line no: {} Offset: {} Length: {}", line.line_number,
                                line.offset, line.length);
                break;
            }

            cbyte_span source_data(p, line.length);
            byte_span target_data(target, current_frame_->buffer->end() - target);
            ebu_list::copy(source_data, target_data);

            p += line.length;
        }
    }

    dscp_.handle_packet(packet);

    this->on_packet(info);
}
