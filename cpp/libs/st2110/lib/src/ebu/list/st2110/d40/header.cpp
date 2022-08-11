#include "ebu/list/core/idioms.h"
#include "ebu/list/st2110/d40/packet.h"

using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d40;

constexpr auto word_mask                 = 0x00FF;
constexpr auto word_parity_mask          = 0x0100;
constexpr auto word_inverted_parity_mask = 0x0200;
constexpr auto checksum_mask             = 0x01FF;

uint16_t d40::do_get_bits(const std::byte** data_p, const uint8_t word_len, uint16_t* bit_counter)
{
    LIST_ENFORCE(word_len <= 16, std::invalid_argument,
                 "namespace ebu_list::st2110::d40::do_get_bits() reads 16-bit words maximum");

    uint8_t bit_offset = *bit_counter % 8;
    bool overlap       = ((bit_offset + word_len) > 8);
    uint8_t bit_step   = overlap ? 8 - bit_offset : word_len;
    uint8_t bit_shift  = overlap ? 0 : 8 - (bit_offset + bit_step);
    uint8_t bit_mask   = (1 << bit_step) - 1;
    uint16_t res       = (static_cast<uint16_t>(**data_p) >> bit_shift) & bit_mask;

    *bit_counter += bit_step;
    (*data_p) += (bit_shift == 0) ? 1 : 0;

    if(overlap)
    {
        res = res << (word_len - bit_step);
        res += do_get_bits(data_p, word_len - bit_step, bit_counter);
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
bool d40::sanity_check_word(const uint16_t word)
{
    uint16_t word_copy = (word & word_mask);
    uint8_t parity_bit = (word & word_parity_mask) >> 8;
    uint8_t parity     = 0;
    bool res           = (parity_bit != ((word & word_inverted_parity_mask) >> 9));

    while(word_copy)
    {
        parity ^= (word_copy & 1);
        word_copy >>= 1;
    }
    res = (parity == parity_bit) && res;

    if(!res)
    {
        logger()->trace("Parity error in {}", word);
    }

    return res;
}

/*
 * sanity_ckeck_sum verifies the parity of a 10-bit checksum based on:
 * https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1364-3-201510-I!!PDF-E.pdf
 * - b8-0: sum of 9-bit words of payload
 * - b9: not b8
 */
bool d40::sanity_check_sum(const uint16_t checksum, uint16_t sum)
{
    if((checksum & checksum_mask) != (sum & checksum_mask))
    {
        //        logger()->debug("Ancillary checksum error");
        return false;
    }

    if(((checksum & word_parity_mask) >> 8) == ((checksum & word_inverted_parity_mask) >> 9))
    {
        //        logger()->debug("Ancillary checksum malformed");
        return false;
    }

    return true;
}
