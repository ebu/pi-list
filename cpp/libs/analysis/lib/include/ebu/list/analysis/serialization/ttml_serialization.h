#pragma once

#include "ebu/list/ttml/ttml_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list::ttml
{
    nlohmann::json to_json(const description& desc);
    description from_json(const nlohmann::json& j);
}

namespace ebu_list::analysis::ttml
{
    struct stream_details
    {
        uint32_t packet_count = 0;
        uint32_t dropped_packet_count = 0;
        uint32_t wrong_marker_count = 0;

        clock::time_point first_packet_ts{};
        clock::time_point last_packet_ts{};

        static stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const stream_details& details);
    };
}

