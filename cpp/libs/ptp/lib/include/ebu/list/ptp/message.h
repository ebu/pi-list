#pragma once

#include "ebu/list/core/math/decimal.h"
#include "ebu/list/core/types.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp
{
#pragma pack(push, 1)
    // This is useful just to find out the PTP version
    struct common_message_header
    {
        uint8_t reserved_1;
        uint8_t version_ptp : 4;
        uint8_t reserved_2 : 4;
    };

    static_assert(sizeof(common_message_header) == 2);
#pragma pack(pop)

    // used to convey a 80-bits timestamp, represented in
    // PTP messages as 48-bit seconds, plus 32-bit nanoseconds.
    using ts80   = decimal<std::nano>;
    using byte80 = std::array<byte, 10>;
    ts80 to_ts80(const byte80& raw);

    // TODO: this only works for values which integral are small enough to be converted to nanoseconds nad still fit in
    // 64-bits
    clock::time_point to_time_point(const ts80& t);
} // namespace ebu_list::ptp
