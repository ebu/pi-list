#include "rtp_playback.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;

ebu_list::rtp_playback::rtp_playback(ipv4::endpoint destination)
    : sender_(), destination_(std::move(destination))
{
}

void ebu_list::rtp_playback::on_data(const ebu_list::rtp::packet& p)
{
    const auto p_timestamp = p.info.rtp.view().timestamp();
    if( p_timestamp !=  last_packet_timestamp_ )
    {
        increment_per_frame_ = p_timestamp - last_packet_timestamp_;
        last_packet_timestamp_ = p_timestamp;
    }

    packets_.push_back(p);
}

void ebu_list::rtp_playback::on_complete()
{
    malloc_sbuffer_factory f;

    logger()->info("Sending packets in loop to {}", to_string(destination_));
    logger()->info("Calculated increment per frame is {}", increment_per_frame_);

    uint32_t next_timestamp = 0;
    uint16_t next_sequence_number = 0;

    for(int i = 0; ; ++i)
    {
        for(auto& p : packets_)
        {
            const auto old_raw_rtp_header = p.info.rtp.data().view();
            const auto header_size = old_raw_rtp_header.size();

            auto buffer = f.get_buffer(header_size);
            auto header_span = gsl::make_span(buffer->begin(), header_size);

            bisect::bimo::copy(old_raw_rtp_header, header_span);

            // change timestamp and sequence number
            auto header = reinterpret_cast<rtp::raw_header*>(header_span.data());
            header->timestamp = to_net(next_timestamp);
            header->sequence_number = to_net(next_sequence_number++);

            if( p.info.rtp.view().marker() )
            {
                LIST_ASSERT(increment_per_frame_ > 0);
                next_timestamp += increment_per_frame_;
            }

            // assemble the new packet
            auto rtp_payload = p.sdu;
            auto new_header = oview(std::move(buffer));
            auto rtp_packet = merge(f, std::move(new_header), std::move(rtp_payload));

            // send the packet
            sender_.send_data(rtp_packet.view(), destination_);
        }
    }
}

void ebu_list::rtp_playback::on_error(std::exception_ptr ptr)
{
    try
    {
        std::rethrow_exception(ptr);
    }
    catch (std::exception& e)
    {
        logger()->info("on_error: {}", e.what());
    }
}