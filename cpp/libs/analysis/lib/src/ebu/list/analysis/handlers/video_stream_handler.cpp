#include "ebu/list/analysis/handlers/video_stream_handler.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/st2110/d20/packet.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------
namespace
{
    int get_line_size_bytes(const video_description& desc)
    {
        const auto line_size = desc.dimensions.width * video::samples_per_pixel(desc.sampling) * desc.color_depth;
        return static_cast<int>(line_size / 8);
    }

    int get_buffer_size_for(const video_description& desc)
    {
        const auto frame_height = desc.scan_type == media::video::scan_type::PROGRESSIVE ? desc.dimensions.height
                                                                                         : desc.dimensions.height / 2;

        return frame_height * get_line_size_bytes(desc);
    }

    int offset_to_byte_offset(int offset, const video_description& desc)
    {
        return static_cast<int>(offset * video::samples_per_pixel(desc.sampling) * desc.color_depth / 8);
    }

    void throw_if_inconsistent(const line_header_lens& header, media::video::scan_type scan)
    {
        if(header.field_identification() != 0 && scan != media::video::scan_type::INTERLACED)
        {
            throw std::runtime_error("Stream marked as progessive but ST2110 "
                                     "packets transport interlaced lines");
        }
        // todo: detect streams marked as interlaced but is progressive
    }

    void update_net_info_with_address_validation(media::network_info& info, const rtp::packet_info& packet_info)
    {
        info.valid_multicast_mac_address =
            info.valid_multicast_mac_address && is_multicast_address(packet_info.ethernet_info.destination_address);

        info.valid_multicast_ip_address =
            info.valid_multicast_ip_address && is_multicast_address(packet_info.udp.destination_address);

        info.multicast_address_match =
            info.multicast_address_match && is_same_multicast_address(packet_info.ethernet_info.destination_address,
                                                                      packet_info.udp.destination_address);

        //        logger()->trace(
        //            "valid_multicast_mac_address: {} -
        //            valid_multicast_ip_address: {} - "
        //            "multicast_address_match: {}",
        //            info.valid_multicast_mac_address,
        //            info.valid_multicast_ip_address,
        //            info.multicast_address_match);
    }
} // namespace
//------------------------------------------------------------------------------

video_stream_handler::video_stream_handler(decode_video should_decode_video, rtp::packet first_packet,
                                           serializable_stream_info info, video_stream_details details,
                                           completion_handler ch)
    : should_decode_video_(should_decode_video == decode_video::yes), info_(std::move(info)),
      video_description_(std::move(details)), completion_handler_(std::move(ch))
{
    logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));

    video_description_.first_frame_ts  = first_packet.info.rtp.view().timestamp();
    video_description_.last_frame_ts   = video_description_.first_frame_ts;
    video_description_.first_packet_ts = first_packet.info.udp.packet_time;

    update_net_info_with_address_validation(info_.network, first_packet.info);

    info_.network.has_extended_header = first_packet.info.rtp.view().extension();

    info_.state = stream_state::ON_GOING_ANALYSIS; // mark as analysis started
}

void video_stream_handler::new_frame()
{
    current_frame_            = std::make_unique<frame>();
    current_frame_->timestamp = video_description_.last_frame_ts;

    if(should_decode_video_)
    {
        current_frame_->buffer = block_factory_.get_buffer(get_buffer_size_for(video_description_.video));
    }

    this->on_frame_started(*current_frame_);
}

const video_stream_details& video_stream_handler::info() const
{
    video_description_.video.rate = rate_.rate().value_or(media::video::Rate(0));
    return video_description_;
}

const serializable_stream_info& video_stream_handler::network_info() const
{
    return info_;
}

void video_stream_handler::detect_frame_transition(uint32_t timestamp)
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

void video_stream_handler::on_data(const rtp::packet& packet)
{
    if(!current_frame_) new_frame();

    update_net_info_with_address_validation(info_.network, packet.info);

    video_description_.last_packet_ts = packet.info.udp.packet_time;
    const auto ts                     = packet.info.rtp.view().timestamp();
    detect_frame_transition(ts);

    parse_packet(packet); // todo: allow moving out of a packet

    ++video_description_.packet_count;
    rate_.on_packet(ts);
}

void video_stream_handler::on_complete()
{
    if(!current_frame_) return;

    if(rtp_seqnum_analyzer_.num_dropped_packets() > 0)
    {
        video_description_.dropped_packet_count += rtp_seqnum_analyzer_.num_dropped_packets();
        video_description_.dropped_packet_samples = rtp_seqnum_analyzer_.dropped_packets();
        logger()->info("video rtp packet drop: {}", video_description_.dropped_packet_count);
    }

    info_.network.dscp = dscp_.get_info();

    video_description_.video.packing_mode = pm_analyzer_.get_mode();

    ++video_description_.frame_count;
    this->on_frame_complete(std::move(current_frame_));

    info_.state = stream_state::ANALYZED;
    completion_handler_(*this);
}

void video_stream_handler::on_error(std::exception_ptr)
{
}

// #define LIST_TRACE
void video_stream_handler::parse_packet(const rtp::packet& packet)
{
    if (packet.info.rtp.view().extension())
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

        throw_if_inconsistent(line_header, video_description_.video.scan_type);

        video_description_.max_line_number =
            std::max(video_description_.max_line_number, int(line_header.line_number()));

        LIST_ENFORCE(line_index < info.line_info.size(), std::runtime_error,
                     "Only three lines per packet allowed by ST2110-20");

        info.line_info[line_index].continuation         = line_header.continuation();
        info.line_info[line_index].field_identification = line_header.field_identification();
        info.line_info[line_index].length               = line_header.length();
        info.line_info[line_index].line_number          = line_header.line_number();
        info.line_info[line_index].offset               = line_header.offset();
        info.line_info[line_index].valid                = true;

        if(line_header.continuation())
        {
            video_description_.video.has_continuation_bit_set = true;
        }

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
                logger()->error("buffer out of bounds. Line no: {} Offset: {} Length: {}", line.line_number,
                                line.offset, line.length);
                break;
            }

            const auto byte_offset = offset_to_byte_offset(line.offset, video_description_.video);

            const auto target = current_frame_->buffer->begin() +
                                get_line_size_bytes(video_description_.video) * line.line_number + byte_offset;
            if(target + line.length > current_frame_->buffer->end())
            {
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

    rtp_seqnum_analyzer_.handle_packet(info.full_sequence_number, packet.info.udp.packet_time);
    dscp_.handle_packet(packet);

    this->on_packet(info);
}
