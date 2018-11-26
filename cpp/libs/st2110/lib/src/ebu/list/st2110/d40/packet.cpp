#include "ebu/list/core/idioms.h"
#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d40/packet.h"

using namespace ebu_list::st2110::d40;

constexpr auto word_mask = 0x00FF;
constexpr auto word_parity_mask = 0x0100;
constexpr auto word_inverted_parity_mask = 0x0200;
constexpr auto checksum_mask = 0x01FF;

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
