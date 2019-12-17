#include "stream_listener.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/analysis/serialization/stream_identification.h"
#include "pch.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;

namespace
{
    void save_on_db(const db_serializer& db, const stream_with_details& stream_info,
                    std::map<std::string, std::vector<std::string>>& detectors_error_codes, int64_t num_packets = 0,
                    uint16_t num_dropped_packets = 0)
    {

        nlohmann::json serialized_streams_details = stream_with_details_serializer::to_json(stream_info);
        if(num_packets > 0)
        {
            serialized_streams_details["statistics"]["packet_count"]         = num_packets;
            serialized_streams_details["statistics"]["dropped_packet_count"] = num_dropped_packets;
        }

        if(detectors_error_codes["video"].size() > 0)
            serialized_streams_details["media_type_validation"]["video"] = detectors_error_codes["video"];
        if(detectors_error_codes["audio"].size() > 0)
            serialized_streams_details["media_type_validation"]["audio"] = detectors_error_codes["audio"];
        if(detectors_error_codes["anc"].size() > 0)
            serialized_streams_details["media_type_validation"]["anc"] = detectors_error_codes["anc"];

        db.insert(constants::db::offline, constants::db::collections::streams, serialized_streams_details);
    }
} // namespace

stream_listener::stream_listener(rtp::packet first_packet, std::string pcap_id, std::string mongo_url)
    : detector_(first_packet), num_packets_(1), db_(mongo_url)
{
    seqnum_analyzer_.handle_packet(static_cast<uint16_t>(first_packet.info.rtp.view().sequence_number()));

    stream_id_.network.source_mac      = first_packet.info.ethernet_info.source_address;
    stream_id_.network.source          = source(first_packet.info.udp);
    stream_id_.network.destination_mac = first_packet.info.ethernet_info.destination_address;
    stream_id_.network.destination     = destination(first_packet.info.udp);
    stream_id_.network.ssrc            = first_packet.info.rtp.view().ssrc();
    stream_id_.network.payload_type    = first_packet.info.rtp.view().payload_type();
    stream_id_.pcap                    = std::move(pcap_id);
}

void stream_listener::on_data(const rtp::packet& packet)
{
    if(packet.sdu.view().size() == 0 && packet.info.rtp.view().extension())
    {
        // logger()->info("Skipping packet containing only extension data");
    }
    else
    {
        detector_.on_data(packet);
    }

    // NOTE: seqnum_analyzer_ is looking for dropped packets but only for
    // streams of unknown types. Therefore it only assumes the presence of
    // RTP's sequence number field, hence the uint16_t qualification.
    seqnum_analyzer_.handle_packet(static_cast<uint16_t>(packet.info.rtp.view().sequence_number()));
    num_packets_++;
}

void stream_listener::on_complete()
{
    detector_.on_complete();

    const auto format                                                     = detector_.get_details();
    std::map<std::string, std::vector<std::string>> detectors_error_codes = detector_.get_error_codes();

    media_stream_details details;

    bool is_valid = true;

    if(std::holds_alternative<d20::video_description>(format))
    {
        const auto video_format = std::get<d20::video_description>(format);

        stream_id_.type  = media::media_type::VIDEO;
        stream_id_.state = StreamState::READY;

        video_stream_details video_details{};
        video_details.video = video_format;
        details             = video_details;
    }
    else if(std::holds_alternative<d30::audio_description>(format))
    {
        const auto audio_format = std::get<d30::audio_description>(format);

        stream_id_.type  = media::media_type::AUDIO;
        stream_id_.state = StreamState::READY;

        audio_stream_details audio_details{};
        audio_details.audio = audio_format;
        details             = audio_details;
    }
    else if(std::holds_alternative<d40::anc_description>(format))
    {
        const auto anc_format = std::get<d40::anc_description>(format);

        stream_id_.type  = media::media_type::ANCILLARY_DATA;
        stream_id_.state = StreamState::READY;

        anc_stream_details anc_details{};
        anc_details.anc = anc_format;
        details         = anc_details;
    }
    else
    {
        stream_id_.state = StreamState::NEEDS_INFO;
    }

    if(is_valid)
    {
        stream_with_details swd{stream_id_, details};

        if(stream_id_.state != StreamState::NEEDS_INFO)
            save_on_db(db_, swd, detectors_error_codes);
        else
            save_on_db(db_, swd, detectors_error_codes, num_packets_,
                       static_cast<uint16_t>(seqnum_analyzer_.dropped_packets()));
    }

    return;
}

void stream_listener::on_error(std::exception_ptr ex)
{
    detector_.on_error(ex);
}
