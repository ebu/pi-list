#pragma once

#include "ebu/list/core/types.h"

//------------------------------------------------------------------------------

namespace ebu_list::st2110::d40
{
    // from RFC8331 - 2.1. Payload Header Definitions
    // These two bits relate to signaling the field specified by the
    // RTP timestamp in an interlaced SDI raster.  A value of 0b00
    // indicates that either the video format is progressive or that
    // no field is specified.  A value of 0b10 indicates that the
    // timestamp refers to the first field of an interlaced video
    // signal.  A value of 0b11 indicates that the timestamp refers
    // to the second field of an interlaced video signal.  The value
    // 0b01 is not valid.  Receivers SHOULD ignore an ANC data
    // packet with an F field value of 0b01 and SHOULD process any
    // other ANC data packets with valid F field values that are
    // present in the RTP payload.
    enum class field_kind
    {
        progressive             = 0b00,
        interlaced_first_field  = 0b10,
        interlaced_second_field = 0b11,
        invalid                 = 0b01
    };

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
        uint8_t field_identification : 2; // See field_kind

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

    /*
     * reads an n-bit word from a byte-unaligned buffer with
     * n_max=16. The logic relies on the overlap condition (see case 3
     * below). The function selects the bits from the current byte. In
     * case of an overlap, the function is called recursively to get LSB
     * from the next byte in addition to MSB.
     *
     *   +--------------------------------------------------------+
     *   |                       Byte                             +
     *   +----------------+-----------------------+---------------+
     *   |                |                       |               |
     * 1 |<- bit_offset ->|<- word_len/bit_step ->|<- bit_shift ->|
     *   |                |                       |               |
     *   +----------------+-----------------------+---------------+
     *   |                |                                       |
     * 2 |<- bit_offset ->|<--------- word_len/bit_step --------->|
     *   |                |                                       |
     *   +----------------+---------------------------------------+
     *   |                |                                       |
     * 3 |<- bit_offset ->|<-------------- bit_step ------------->|
     *   |                |<----------------------- word_len ------ ...
     *   +----------------+---------------------------------------+
     */
    uint16_t do_get_bits(const std::byte** data_p, const uint8_t word_len, uint16_t* bit_counter);

    template <int word_len> auto get_bits(const std::byte** data_p, uint16_t* bit_counter)
    {
        // TODO: select return type automatically
        if constexpr(word_len <= 8)
        {
            return static_cast<uint8_t>(do_get_bits(data_p, word_len, bit_counter));
        }
        else
        {
            static_assert(word_len <= 16);
            return static_cast<uint16_t>(do_get_bits(data_p, word_len, bit_counter));
        }
    }

    bool sanity_check_word(const uint16_t word);
    bool sanity_check_sum(const uint16_t checksum, uint16_t sum);

#pragma pack(pop)
} // namespace ebu_list::st2110::d40
