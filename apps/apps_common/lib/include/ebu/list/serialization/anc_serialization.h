#pragma once

#include "ebu/list/st2110/d40/anc_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace st2110::d40
    {
        nlohmann::json to_json(const anc_description& desc);
        anc_description from_json(const nlohmann::json& j);
    }

    struct anc_stream_details
    {
        st2110::d40::anc_description anc;

        uint32_t packet_count = 0;
        uint32_t dropped_packet_count = 0;
        uint32_t frame_count = 0; // frame concept applies to ancillary too
        uint32_t last_frame_ts = 0;
        clock::time_point first_packet_ts {};
        clock::time_point last_packet_ts {};

        /* serialization details */
        static anc_stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const anc_stream_details& details);
    };
}
