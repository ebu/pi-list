#include "ebu/list/core/idioms.h"
#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d40/packet.h"

using namespace ebu_list::st2110::d40;

constexpr auto word_mask = 0x00FF;
constexpr auto word_parity_mask = 0x0100;
constexpr auto word_inverted_parity_mask = 0x0200;
constexpr auto checksum_mask = 0x01FF;

namespace ebu_list::st2110::d40
{
    /*
     * get_bits() reads an n-bit word from a byte-unaligned buffer with
     * n_max=16. The logic relies on the overlap condition (see case 3
     * below). The function selects the bits from the current byte. In
     * case of an overlap, the function is called recursively to get LSB
     * from the next byte in addition to MSB.
     *
     *   +-------------------------------------------------------+
     *   |                       Byte                            +
     *   +----------------+-----------------------+--------------+
     *   |                |                       |              |
     * 1 |<- bit_offset ->|<- word_len/bit_step ->|<- bit_shit ->|
     *   |                |                       |              |
     *   +----------------+-----------------------+--------------+
     *   |                |                                      |
     * 2 |<- bit_offset ->|<--------- word_len/bit_step -------->|
     *   |                |                                      |
     *   +----------------+--------------------------------------+
     *   |                |                                      |
     * 3 |<- bit_offset ->|<-------------- bit_step ------------>|
     *   |                |<----------------------- word_len ------ ...
     *   +----------------+--------------------------------------+
     */
    uint16_t get_bits(const std::byte** data_p, const uint8_t word_len, uint16_t *bit_counter)
    {
        LIST_ENFORCE(word_len <= 16, std::invalid_argument,
                "namespace ebu_list::st2110::d40::get_bits() reads 16-bit words maximum");

        uint8_t bit_offset = *bit_counter % 8;
        bool overlap = ((bit_offset + word_len) > 8);
        uint8_t bit_step = overlap? 8 - bit_offset : word_len;
        uint8_t bit_shift = overlap? 0 : 8 - (bit_offset + bit_step);
        uint8_t bit_mask = (1 << bit_step) - 1;
        uint16_t res = (static_cast<uint16_t>(**data_p) >> bit_shift) & bit_mask;

        *bit_counter += bit_step;
        (*data_p) += (bit_shift == 0)? 1 : 0;

        if (overlap){
            res = res << (word_len - bit_step);
            res += get_bits(data_p, word_len - bit_step, bit_counter);
        }

        return res;
    }

    /*
     * sanity_ckeck_word verifies the parity of a 10-bit word based on:
     * https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1364-3-201510-I!!PDF-E.pdf
     * - b7-0: data
     * - b8: even parity for b7-0
     * - b9: not b8
     */
    bool sanity_check_word(const uint16_t word)
    {
        uint16_t word_copy = (word & word_mask);
        uint8_t parity_bit = (word & word_parity_mask) >> 8;
        uint8_t parity = 0;
        bool res = (parity_bit != ((word & word_inverted_parity_mask) >> 9));

        while(word_copy)
        {
            parity ^= (word_copy & 1);
            word_copy >>= 1;
        }
        res = (parity == parity_bit)? res : false;

        if (!res)
        {
            logger()->debug("Parity error in {}", word);
        }

        return res;
    }

    /*
     * sanity_ckeck_sum verifies the parity of a 10-bit checksum based on:
     * https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1364-3-201510-I!!PDF-E.pdf
     * - b8-0: sum of 9-bit words of payload
     * - b9: not b8
     */
    bool sanity_check_sum(const uint16_t checksum, uint16_t  sum)
    {
        if ((checksum & checksum_mask) != (sum & checksum_mask))
        {
            logger()->debug("Ancillary checksum error");
            return false;
        }

        if (((checksum & word_parity_mask) >> 8) == ((checksum & word_inverted_parity_mask) >> 9))
        {
            logger()->debug("Ancillary checksum malformed");
            return false;
        }

        return true;
    }
}

//////////////////////////////////////////////////////////////////////

anc_packet_header_lens::anc_packet_header_lens(const raw_anc_packet_header& raw_packet_header)
    : raw_packet_header_(raw_packet_header)
{
}

uint8_t anc_packet_header_lens::color_channel() const
{
    return raw_packet_header_.color_channel;
}

uint16_t anc_packet_header_lens::line_num() const
{
    return raw_packet_header_.line_num;
}

uint16_t anc_packet_header_lens::horizontal_offset() const
{
    return raw_packet_header_.horizontal_offset;
}

uint8_t anc_packet_header_lens::did() const
{
    return static_cast<uint8_t>(raw_packet_header_.did & word_mask);
}

uint8_t anc_packet_header_lens::sdid() const
{
    return static_cast<uint8_t>(raw_packet_header_.sdid & word_mask);
}

uint8_t anc_packet_header_lens::data_count() const
{
    return static_cast<uint8_t>(raw_packet_header_.data_count & word_mask);
}

uint8_t anc_packet_header_lens::stream_num() const
{
    return raw_packet_header_.stream_flag? raw_packet_header_.stream_num : 0;
}

bool anc_packet_header_lens::sanity_check() const
{
    // TODO may be worth verifying the checksum of the payload

    return (sanity_check_word(raw_packet_header_.did) && \
            sanity_check_word(raw_packet_header_.sdid) && \
            sanity_check_word(raw_packet_header_.data_count));
}

void anc_packet_header_lens::dump() const
{
    logger()->debug("Ancillary packet: color_channel={}, line_num={}, offset={}, stream={}, did={}, sdid={}, data_count={}",
            color_channel(),
            line_num(),
            horizontal_offset(),
            stream_num(),
            did(),
            sdid(),
            data_count());
}

anc_header_lens::anc_header_lens(const raw_anc_header& raw_header)
    : raw_header_(raw_header)
{
}

uint16_t anc_header_lens::length() const
{
    return to_native(raw_header_.length);
}

uint8_t anc_header_lens::anc_count() const
{
    return raw_header_.anc_count;
}

uint8_t anc_header_lens::field_identification() const
{
    return raw_header_.field_identification;
}
