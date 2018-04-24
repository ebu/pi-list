#pragma once

#include "ebu/list/core/types.h"

//------------------------------------------------------------------------------

namespace ebu_list::st2110::d20
{
#pragma pack(push, 1)

    // from https://tools.ietf.org/html/rfc4175
    //
    // 0                               16                             32
    // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    // |   Extended Sequence Number    |            Length             |
    // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    // |F|          Line No            |C|           Offset            |
    // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    // |            Length             |F|          Line No            |
    // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    // |C|           Offset            |                               .
    // +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+                               .
    // .                                                               .
    // .                 Two (partial) lines of video data             .
    // .                                                               .
    // +---------------------------------------------------------------+

    struct raw_extended_sequence_number
    {
        net_uint16_t esn;
    };
    static_assert(sizeof(raw_extended_sequence_number) == 2);

    struct raw_line_header
    {
        net_uint16_t length;

        uint8_t line_no_1 : 7;
        uint8_t field_identification : 1;

        uint8_t line_no_0;

        uint8_t offset_1 : 7;
        uint8_t continuation : 1;

        uint8_t offset_0;
    };
    static_assert(sizeof(raw_line_header) == 6);

    static_assert(platform::config::little_endian);

#pragma pack(pop)
}
