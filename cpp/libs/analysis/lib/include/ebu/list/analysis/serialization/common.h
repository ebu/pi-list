#pragma once

#include "ebu/list/core/types.h"
#include "nlohmann/json.hpp"

namespace ebu_list::analysis
{
    struct common_stream_details
    {
        uint32_t packet_count         = 0;
        uint32_t dropped_packet_count = 0;
        clock::time_point first_packet_ts{};
        clock::time_point last_packet_ts{};
    };

    void to_json(nlohmann::json& j, const common_stream_details& p);
    void from_json(const nlohmann::json& j, common_stream_details& p);
} // namespace ebu_list::analysis
