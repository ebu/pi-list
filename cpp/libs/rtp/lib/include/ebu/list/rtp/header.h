#pragma once

#include "ebu/list/core/types.h"

namespace ebu_list::rtp
{
#pragma pack(push, 1)

    // from https://tools.ietf.org/html/rfc3550
    //    0                   1                   2                   3
    //    0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
    //   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    //   |V=2|P|X|  CC   |M|     PT      |       sequence number         |
    //   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    //   |                           timestamp                           |
    //   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    //   |           synchronization source (SSRC) identifier            |
    //   +=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
    //   |            contributing source (CSRC) identifiers             |
    //   |                             ....                              |
    //   +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    struct raw_header 
    {
        uint8_t csrc_count : 4;
        uint8_t extension : 1;
        uint8_t padding : 1;
        uint8_t version : 2;

        uint8_t payload_type : 7;
        uint8_t marker : 1;

        net_uint16_t sequence_number;
        net_uint32_t timestamp;
        net_uint32_t ssrc;
    };
    static_assert(platform::config::little_endian);
    static_assert(sizeof(raw_header) == 12);

#pragma pack(pop)
}
