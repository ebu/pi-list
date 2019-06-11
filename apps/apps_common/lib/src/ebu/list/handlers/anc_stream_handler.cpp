#include "ebu/list/handlers/anc_stream_handler.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d40;

//------------------------------------------------------------------------------

anc_stream_handler::anc_stream_handler(rtp::packet first_packet, serializable_stream_info info,
    anc_stream_details details, completion_handler ch)
    : info_(std::move(info)),
    anc_description_(std::move(details)),
    completion_handler_(std::move(ch))
{
    logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source), to_string(info_.network.destination));

    info.state = StreamState::ON_GOING_ANALYSIS;

    anc_description_.first_packet_ts = first_packet.info.udp.packet_time;
    anc_description_.last_frame_ts = first_packet.info.rtp.view().timestamp();

    const auto& anc = this->info();
    nlohmann::json  j = anc_stream_details::to_json(anc);
    //logger()->info("Stream info:\n {}", j.dump(2, ' '));
}

const anc_stream_details& anc_stream_handler::info() const
{
    return anc_description_;
}

const serializable_stream_info& anc_stream_handler::network_info() const
{
    return info_;
}

void anc_stream_handler::on_data(const rtp::packet& packet)
{
    ++anc_description_.packet_count;
    anc_description_.last_packet_ts = packet.info.udp.packet_time;

    const auto timestamp = packet.info.rtp.view().timestamp();
    if (timestamp != anc_description_.last_frame_ts)
    {
        anc_description_.last_frame_ts = timestamp;
        anc_description_.frame_count++;
    }

    logger()->debug("Ancillary packet={}, frame={}", anc_description_.packet_count, anc_description_.frame_count);

    const auto previous_sequence_number = last_sequence_number_;
    parse_packet(packet);

    if(previous_sequence_number)
    {
        const auto current_sequence_number = last_sequence_number_;
        const auto sn_difference = *current_sequence_number - *previous_sequence_number;

        // TODO: deal with wrap-around?
        if(sn_difference > 1)
        {
            anc_description_.dropped_packet_count += sn_difference - 1;
            logger()->info("ancillary rtp packet drop: {}", anc_description_.dropped_packet_count);
        }
    }

}

void anc_stream_handler::on_complete()
{
    this->on_stream_complete();
    info_.state = StreamState::ANALYZED;
    completion_handler_(*this);
}

void anc_stream_handler::on_error(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch (std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}

void anc_stream_handler::parse_packet(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    auto p = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();
    const auto extended_sequence_number = to_native(reinterpret_cast<const raw_extended_sequence_number*>(p)->esn);
    const uint32_t full_sequence_number = (extended_sequence_number << 16) | packet.info.rtp.view().sequence_number();

    // skip esn
    p += sizeof(raw_extended_sequence_number);
    while (p < end)
    {
        // TODO fill buffer per stream found in anc_description_.anc
        this->on_sample();
        p = end;
    }

    last_sequence_number_ = full_sequence_number;
}
