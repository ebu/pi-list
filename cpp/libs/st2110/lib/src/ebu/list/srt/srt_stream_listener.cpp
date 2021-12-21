#include "ebu/list/srt/srt_stream_listener.h"
#include "ebu/list/analysis/serialization/stream_identification.h"
#include "ebu/list/srt/header.h"
#include <vector>

using namespace ebu_list;
using namespace analysis;
using namespace ebu_list::srt;
using nlohmann::json;

namespace
{
    json make_stream_info(const stream_with_details& stream_info,
                          st2110::detector::status_description& status_description, int64_t num_packets = 0,
                          int64_t num_dropped_packets                                        = 0,
                          std::vector<ebu_list::rtp::packet_gap_info> dropped_packet_samples = {},
                          int64_t num_retransmitted_packets                                  = 0)
    {
        json serialized_streams_details = stream_with_details_serializer::to_json(stream_info);
        if(num_packets > 0)
        {
            serialized_streams_details["statistics"]["packet_count"]               = num_packets;
            serialized_streams_details["statistics"]["packet_retransmitted_count"] = num_retransmitted_packets;
            serialized_streams_details["statistics"]["dropped_packet_count"]       = num_dropped_packets;
            serialized_streams_details["statistics"]["dropped_packet_samples"]     = dropped_packet_samples;
        }

        if(status_description.state == st2110::detector::state::invalid)
            serialized_streams_details["media_type_validation"]["srt"] = status_description.error_code;

        return serialized_streams_details;
    }
} // namespace

///////////////////////////////////////////////////////////////////////////////

srt_stream_listener::srt_stream_listener(const udp::datagram& first_datagram, std::string_view pcap_id)
    : num_packets_(0)
{
    stream_id_.pcap                    = pcap_id;
    stream_id_.network.source_mac      = first_datagram.ethernet_info.source_address;
    stream_id_.network.source          = source(first_datagram.info);
    stream_id_.network.destination_mac = first_datagram.ethernet_info.destination_address;
    stream_id_.network.destination     = destination(first_datagram.info);
}

void srt_stream_listener::on_data(const udp::datagram& datagram)
{
    auto& sdu           = datagram.sdu;
    auto payload_header = header(sdu);

    srt_sequence_number_analyzer_.handle_packet(static_cast<uint32_t>(payload_header.get_packet_sequence_number()),
                                                datagram.info.packet_time, payload_header.get_retransmission_flag(),
                                                payload_header.get_packet_type_flag());
    ++num_packets_;

    if(status_description_.state != st2110::detector::state::detecting) return;

    const auto result = detector_.handle_data(datagram);
    if(result.state == st2110::detector::state::invalid)
    {
        status_description_ = result;
    }
    else if(result.state == st2110::detector::state::valid)
    {
        status_description_ = result;
    }
}

void srt_stream_listener::on_complete()
{
    if(status_description_.state == st2110::detector::state::invalid)
    {
        stream_id_.type      = media::media_type::UNKNOWN;
        stream_id_.full_type = media::full_media_from_string("unknown");
        stream_id_.state     = stream_state::NEEDS_INFO;
    }
    else if(status_description_.state == st2110::detector::state::valid)
    {
        stream_id_.type      = media::media_type::SRT;
        stream_id_.full_type = media::full_media_type::SRT;
        stream_id_.state     = stream_state::READY;
    }

    stream_with_details swd{stream_id_, {}};
    info_ = make_stream_info(swd, status_description_, num_packets_,
                             static_cast<uint32_t>(srt_sequence_number_analyzer_.num_dropped_packets()),
                             srt_sequence_number_analyzer_.dropped_packets(),
                             srt_sequence_number_analyzer_.num_retransmitted_packets());
}

void srt_stream_listener::on_error(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch(std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}

st2110::detector::status_description srt_stream_listener::status() const noexcept
{
    return status_description_;
}

nlohmann::json srt_stream_listener::get_info() const
{
    return info_;
}