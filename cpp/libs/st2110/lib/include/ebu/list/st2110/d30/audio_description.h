#pragma once

#include "ebu/list/core/media/audio_description.h"
#include "ebu/list/sdp/media_description.h"
#include "ebu/list/st2110/d10/network.h"

namespace ebu_list::st2110::d30
{
    using audio_packet_time = std::chrono::duration<float, std::milli>;
    audio_packet_time parse_packet_time(std::string_view s);
    std::string to_string(audio_packet_time t);

    struct audio_description : d10::stream_information
    {
        ebu_list::media::audio::audio_encoding encoding;
        ebu_list::media::audio::audio_sampling sampling;
        uint8_t number_channels;
        audio_packet_time packet_time;
    };

    struct st2110_30_sdp_serializer
    {
        explicit st2110_30_sdp_serializer(const audio_description& audio_des);
        void write_rtpmap_line(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& media_description);
        void additional_attributes(std::vector<std::string>& current_lines, const media::network_media_description& media_description);

    private:
        const audio_description& audio_desc_;
    };
}
