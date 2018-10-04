#pragma once

#include "ebu/list/core/types.h"

//------------------------------------------------------------------------------

namespace ebu_list::st2110::d40
{
#pragma pack(push, 1)

   /*
    *  from https://tools.ietf.org/id/draft-ietf-payload-rtp-ancillary-10.xml
    *
    *  0                   1                   2                   3
    *  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *  |   Extended Sequence Number    |            Length             |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *  | ANC_Count     | F |                reserved                   |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *  |C|   Line_Number       |   Horizontal_Offset   |S|  StreamNum  |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *  |         DID       |        SDID       |   Data_Count      |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *                           User_Data_Words...
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *              |   Checksum_Word   |         word_align            |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *  |C|   Line_Number       |   Horizontal_Offset   |S|  StreamNum  |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *  |         DID       |        SDID       |   Data_Count      |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *                           User_Data_Words...
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    *                                  |   Checksum_Word   |word_align |
    *  +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
    */

    struct raw_extended_sequence_number
    {
        net_uint16_t esn;
    };
    static_assert(sizeof(raw_extended_sequence_number) == 2);

    struct raw_anc_header
    {
        net_uint16_t length;

        uint8_t anc_count; // no restriction

        uint8_t reserved_0 : 6;
        uint8_t field_identification : 2; // 0:invalid, 1:progr, 2:top, 3:bottom

        net_uint16_t reserved_1;
    };
    static_assert(sizeof(raw_anc_header) == 6);

    struct raw_anc_packet_header
    {
        uint8_t color_channel;
        uint16_t line_num;
        uint16_t horizontal_offset;
        uint8_t stream_flag;
        uint8_t stream_num;
        uint16_t did;
        uint16_t sdid;
        uint16_t data_count;
    };

    static_assert(platform::config::little_endian);

    uint16_t get_bits(const std::byte** data_p, const uint8_t word_len, uint16_t *bit_counter);

#pragma pack(pop)
}
