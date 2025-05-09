#include "ebu/list/preprocessor/stream_listener.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/analysis/serialization/stream_identification.h"
#include <vector>

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::media;
using namespace ebu_list::st2110;
using nlohmann::json;

namespace
{
    json make_stream_info(const stream_with_details& stream_info,
                          std::map<std::string, std::vector<std::string>>& detectors_error_codes,
                          int64_t num_packets = 0, uint16_t num_dropped_packets = 0,
                          std::vector<ebu_list::rtp::packet_gap_info> dropped_packet_samples = {},
                          uint32_t retransmitted_packets                                     = 0)
    {
        json serialized_streams_details = stream_with_details_serializer::to_json(stream_info);
        if(num_packets > 0)
        {
            serialized_streams_details["statistics"]["packet_count"]           = num_packets;
            serialized_streams_details["statistics"]["dropped_packet_count"]   = num_dropped_packets;
            serialized_streams_details["statistics"]["dropped_packet_samples"] = dropped_packet_samples;
            serialized_streams_details["statistics"]["retransmitted_packets"]  = retransmitted_packets;
        }

        if(detectors_error_codes["video/raw"].size() > 0)
            serialized_streams_details["media_type_validation"]["video/raw"] = detectors_error_codes["video/raw"];
        if(detectors_error_codes["video/jxsv"].size() > 0)
            serialized_streams_details["media_type_validation"]["video/jxsv"] = detectors_error_codes["video/jxsv"];
        if(detectors_error_codes["audio/L16"].size() > 0)
            serialized_streams_details["media_type_validation"]["audio/L16"] = detectors_error_codes["audio/L16"];
        if(detectors_error_codes["audio/L24"].size() > 0)
            serialized_streams_details["media_type_validation"]["audio/L24"] = detectors_error_codes["audio/L24"];
        if(detectors_error_codes["video/smpte291"].size() > 0)
            serialized_streams_details["media_type_validation"]["video/smpte291"] =
                detectors_error_codes["video/smpte291"];
        if(detectors_error_codes["application/ttml+xml"].size() > 0)
            serialized_streams_details["media_type_validation"]["application/ttml+xml"] =
                detectors_error_codes["application/ttml+xml"];

        return serialized_streams_details;
    }
} // namespace

stream_listener::stream_listener(const udp::datagram& first_datagram, std::string_view pcap_id,
                                 std::optional<media::full_media_type> media_type)
    : detector_(media_type)
{
    auto maybe_rtp_packet = rtp::decode(first_datagram.ethernet_info, first_datagram.info, first_datagram.sdu);
    if(!maybe_rtp_packet)
    {
        // logger()->trace("Non-RTP datagram from {} to {}", to_string(source(datagram.info)),
        // to_string(destination(datagram.info)));
        state_ = state::invalid;
        return;
    }

    auto first_packet = std::move(maybe_rtp_packet.value());

    capture_timestamp_                 = first_packet.info.udp.packet_time;
    stream_id_.network.source_mac      = first_packet.info.ethernet_info.source_address;
    stream_id_.network.source          = source(first_packet.info.udp);
    stream_id_.network.destination_mac = first_packet.info.ethernet_info.destination_address;
    stream_id_.network.destination     = destination(first_packet.info.udp);
    stream_id_.network.ssrc            = first_packet.info.rtp.view().ssrc();
    stream_id_.network.payload_type    = first_packet.info.rtp.view().payload_type();
    stream_id_.pcap                    = pcap_id;
}

void stream_listener::on_data(const udp::datagram& datagram)
{
    if(state_ == state::invalid)
    {
        return;
    }
    auto maybe_rtp_packet = rtp::decode(datagram.ethernet_info, datagram.info, datagram.sdu);
    if(!maybe_rtp_packet)
    {
        // logger()->trace("Non-RTP datagram from {} to {}", to_string(source(datagram.info)),
        // to_string(destination(datagram.info)));
        state_ = state::invalid;
        return;
    }

    auto packet = std::move(maybe_rtp_packet.value());

    if(packet.sdu.view().size() == 0 && packet.info.rtp.view().extension())
    {
        // logger()->info("Skipping packet containing only extension data");
    }
    else
    {
        detector_.on_data(packet);
    }

    // NOTE: seqnum_analyzer_ assumes only the presence of
    // RTP's sequence number field, and not any extended field, hence the uint16_t qualification.
    seqnum_analyzer_.handle_packet(static_cast<uint16_t>(packet.info.rtp.view().sequence_number()),
                                   packet.info.udp.packet_time, static_cast<uint32_t>(packet.info.rtp.view().ssrc()));

    dscp_.handle_packet(datagram);

    ++num_packets_;
}

void stream_listener::on_complete()
{
    if(state_ == state::invalid)
    {
        return;
    }

    detector_.on_complete();

    const auto format                                                     = detector_.get_details();
    std::map<std::string, std::vector<std::string>> detectors_error_codes = detector_.get_error_codes();
    media_stream_details details;
    const auto maybe_full_media_type = detector_.get_full_media_type();
    const auto maybe_transport_type  = detector_.get_transport_type();

    stream_id_.network.dscp = dscp_.get_info();

    if(std::holds_alternative<std::nullopt_t>(format) && std::holds_alternative<std::nullopt_t>(maybe_full_media_type))
    {
        stream_id_.full_type           = media::full_media_from_string("unknown");
        stream_id_.full_transport_type = media::full_transport_type_from_string("unknown");

        if(seqnum_analyzer_.retransmitted_packets() > 0)
        {
            stream_id_.full_transport_type = media::full_transport_type_from_string("RIST");
        }

        stream_id_.state = stream_state::NEEDS_INFO;
    }
    else if(std::holds_alternative<std::string>(maybe_full_media_type))
    {
        const auto full_media_type     = std::get<std::string>(maybe_full_media_type);
        stream_id_.full_type           = media::full_media_from_string(full_media_type);
        stream_id_.full_transport_type = media::full_transport_type_from_string("RTP");

        if(media::is_full_media_type_video_jxsv(media::full_media_from_string(full_media_type)))
        {
            stream_id_.type  = media::media_type::VIDEO;
            stream_id_.state = stream_state::READY;
        }
    }
    if(std::holds_alternative<d20::video_description>(format))
    {
        const auto video_format = std::get<d20::video_description>(format);

        stream_id_.type  = media::media_type::VIDEO;
        stream_id_.state = stream_state::READY;

        video_stream_details video_details{};
        video_details.video = video_format;
        details             = video_details;
    }
    else if(std::holds_alternative<d30::audio_description>(format))
    {
        const auto audio_format = std::get<d30::audio_description>(format);

        stream_id_.type  = media::media_type::AUDIO;
        stream_id_.state = stream_state::READY;

        audio_stream_details audio_details{};
        audio_details.audio = audio_format;
        details             = audio_details;
    }
    else if(std::holds_alternative<d40::anc_description>(format))
    {
        const auto anc_format = std::get<d40::anc_description>(format);

        stream_id_.type  = media::media_type::ANCILLARY_DATA;
        stream_id_.state = stream_state::READY;

        anc_stream_details anc_details{};
        anc_details.anc = anc_format;
        details         = anc_details;
    }
    else if(std::holds_alternative<ebu_list::ttml::description>(format))
    {
        //        const auto ttml_format = std::get<ttml::description>(format);

        stream_id_.type  = media::media_type::TTML;
        stream_id_.state = stream_state::READY;

        analysis::ttml::stream_details ttml_details{};
        details = ttml_details;
    }

    stream_with_details swd{stream_id_, details};

    info_ = make_stream_info(swd, detectors_error_codes, num_packets_,
                             static_cast<uint16_t>(seqnum_analyzer_.num_dropped_packets()),
                             seqnum_analyzer_.dropped_packets(), seqnum_analyzer_.retransmitted_packets());
}

std::optional<nlohmann::json> stream_listener::get_info() const
{
    if(state_ == state::invalid)
    {
        return std::nullopt;
    }
    return info_;
}

clock::time_point stream_listener::get_capture_timestamp() const
{
    return capture_timestamp_;
}

void stream_listener::on_error(std::exception_ptr ex)
{
    detector_.on_error(ex);
}
