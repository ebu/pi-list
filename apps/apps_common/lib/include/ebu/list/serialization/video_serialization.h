#pragma once

#include "ebu/list/st2110/d20/video_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace st2110::d20
    {
        nlohmann::json to_json(const video_description& desc);
        video_description from_json(const nlohmann::json& j);
    }

    struct video_stream_details
    {
        st2110::d20::video_description video;

        uint32_t first_frame_ts = 0;
        uint32_t last_frame_ts = 0;
        int max_line_number = -1;
        uint32_t packet_count = 0;
        uint32_t dropped_packet_count = 0;
        uint32_t frame_count = 0;
        clock::time_point first_packet_ts {};
        clock::time_point last_packet_ts {};

        /** serialization details **/
        static video_stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const video_stream_details& details);
    };
}
