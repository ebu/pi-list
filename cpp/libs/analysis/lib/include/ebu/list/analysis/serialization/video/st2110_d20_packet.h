#pragma once

#include "ebu/list/analysis/serialization/rtp/rtp_packet.h"

namespace ebu_list::analysis
{
    struct st2110_d20_packet
    {
        rtp_packet rtp;
        uint32_t full_sequence_number;
        lines_info line_info;

        static nlohmann::json to_json(const st2110_d20_packet& p);
        static st2110_d20_packet from_json(const nlohmann::json& j);
    };
}