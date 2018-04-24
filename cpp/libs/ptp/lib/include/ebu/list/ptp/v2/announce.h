#pragma once

#include "ebu/list/core/types.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct announce_body
    {
        std::array<uint8_t, 10> origintimestamp;
        net_uint16_t current_utc_offset;
        uint8_t reserved;
        uint8_t grandmaster_priority_1;
        std::array<uint8_t, 4> grandmaster_clock_quality;
        uint8_t grandmaster_priority_2;
        std::array<uint8_t, 8> grandmaster_identity;
        net_uint16_t steps_removed;
        uint8_t time_source;
    };

    static_assert(sizeof(announce_body) == 30);
#pragma pack(pop)
}
