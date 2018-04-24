#pragma once

#include <cstdint>

namespace ebu_list::st2110::d10
{
    constexpr uint16_t STANDARD_UDP_SIZE_LIMIT = 1460;
    constexpr uint16_t EXTENDED_UDP_SIZE_LIMIT = 8960;

    struct stream_information
    {
        // obligatory
        // PTP clock

        // optional
        uint16_t max_udp = STANDARD_UDP_SIZE_LIMIT;
    };
}
