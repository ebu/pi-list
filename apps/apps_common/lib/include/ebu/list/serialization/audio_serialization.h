#pragma once

#include "ebu/list/st2110/d30/audio_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace st2110::d30
    {
        nlohmann::json to_json(const audio_description& desc);
        audio_description from_json(const nlohmann::json& j);
    }

    struct audio_stream_details
    {
        st2110::d30::audio_description audio;

        int sample_size = 0;
        int samples_per_packet = 0;
        uint32_t packet_count = 0;
        uint32_t dropped_packet_count = 0;
        uint32_t sample_count = 0;

        clock::time_point first_packet_ts {};
        clock::time_point last_packet_ts {};

        /** serialization details **/
        static audio_stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const audio_stream_details& details);
    };
}
