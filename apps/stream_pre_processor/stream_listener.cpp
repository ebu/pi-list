#include "pch.h"
#include "stream_listener.h"
#include "ebu/list/serialization/stream_identification.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

stream_listener::stream_listener(rtp::packet first_packet, path base_dir, std::string pcap_id)
    : base_dir_(std::move(base_dir)),
    pcap_id_(std::move(pcap_id)),
    detector_(first_packet)
{
    stream_id_.network.source = source(first_packet.info.udp);
    stream_id_.network.destination = destination(first_packet.info.udp);
    stream_id_.network.ssrc = first_packet.info.rtp.view().ssrc();
    stream_id_.network.payload_type = first_packet.info.rtp.view().payload_type();
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
        write_stream_id_info(base_dir_ / pcap_id_, swd);

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
        write_stream_id_info(base_dir_ / pcap_id_, swd);

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
        stream_id_.type = media::media_type::ANCILLARY_DATA;
        stream_id_.state = StreamState::ANALYZED; // todo: remove me when we process anc data
        stream_with_details swd{ stream_id_, {} };
        write_stream_id_info(base_dir_ / pcap_id_, swd);

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
        write_stream_id_info(base_dir_ / pcap_id_, swd);

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