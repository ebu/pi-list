#include "pch.h"
#include "stream_listener.h"
#include "ebu/list/serialization/stream_identification.h"
#include "ebu/list/constants.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

namespace
{
    void save_on_db(const db_serializer& db, const stream_with_details& stream_info)
    {
        db.insert(constants::db::offline, constants::db::collections::streams, stream_with_details_serializer::to_json(stream_info));
    }
}

stream_listener::stream_listener(rtp::packet first_packet, std::string pcap_id, std::string mongo_url)
    : detector_(first_packet)
    , db_(std::move(mongo_url))
{
    stream_id_.network.source = source(first_packet.info.udp);
    stream_id_.network.destination = destination(first_packet.info.udp);
    stream_id_.network.ssrc = first_packet.info.rtp.view().ssrc();
    stream_id_.network.payload_type = first_packet.info.rtp.view().payload_type();
    stream_id_.pcap = std::move(pcap_id);
}

void stream_listener::on_data(const rtp::packet& packet)
{
    detector_.on_data(packet);
}

void stream_listener::on_complete()
{
    detector_.on_complete();

    const auto format = detector_.get_details();

    if (std::holds_alternative<d20::video_description>(format))
    {
        const auto video_format = std::get<d20::video_description>(format);

        stream_id_.type = media::media_type::VIDEO;
        stream_id_.state = StreamState::READY;

        video_stream_details video_details{};
        video_details.video = video_format;

        stream_with_details swd{ stream_id_, video_details };
        save_on_db(db_, swd);

        logger()->info("----------------------------------------");
        logger()->info("Found video stream {}:", stream_id_.id);
        logger()->info("\tpayload type: {}", stream_id_.network.payload_type);
        logger()->info("\tsource: {}", to_string(stream_id_.network.source));
        logger()->info("\tdestination: {}", to_string(stream_id_.network.destination));
        logger()->info("\tpackets_per_frame: {}", video_details.video.packets_per_frame);

        return;
    }
    else if (std::holds_alternative<d30::audio_description>(format))
    {
        const auto audio_format = std::get<d30::audio_description>(format);

        stream_id_.type = media::media_type::AUDIO;
        stream_id_.state = StreamState::READY;

        audio_stream_details details{};
        details.audio = audio_format;

        stream_with_details swd{ stream_id_, details };
        save_on_db(db_, swd);

        logger()->info("----------------------------------------");
        logger()->info("Found audio stream {}:", stream_id_.id);
        logger()->info("\tpayload type: {}", stream_id_.network.payload_type);
        logger()->info("\tsource: {}", to_string(stream_id_.network.source));
        logger()->info("\tdestination: {}", to_string(stream_id_.network.destination));
        logger()->info("\tencoding: {}", to_string(details.audio.encoding));

        return;
    }
    else if (std::holds_alternative<d40::anc_description>(format))
    {
        const auto anc_format = std::get<d40::anc_description>(format);

        stream_id_.type = media::media_type::ANCILLARY_DATA;
        stream_id_.state = StreamState::ANALYZED; // todo: remove me when we process anc data

        anc_stream_details details{};
        details.anc = anc_format;

        stream_with_details swd{stream_id_, details};
        save_on_db(db_, swd);

        logger()->info("----------------------------------------");
        logger()->info("Found ANC stream {}:", stream_id_.id);
        logger()->info("\tpayload type: {}", stream_id_.network.payload_type);
        logger()->info("\tsource: {}", to_string(stream_id_.network.source));
        logger()->info("\tdestination: {}", to_string(stream_id_.network.destination));
        return;
    }
    else
    {
        stream_with_details swd{ stream_id_,{} };
        stream_id_.state = StreamState::NEEDS_INFO;
        save_on_db(db_, swd);

        logger()->info("----------------------------------------");
        logger()->info("Found unknown stream {}:", stream_id_.id);
        logger()->info("\tpayload type: {}", stream_id_.network.payload_type);
        logger()->info("\tsource: {}", to_string(stream_id_.network.source));
        logger()->info("\tdestination: {}", to_string(stream_id_.network.destination));
        return;
    }
}

void stream_listener::on_error(std::exception_ptr ex)
{
    detector_.on_error(ex);
}
