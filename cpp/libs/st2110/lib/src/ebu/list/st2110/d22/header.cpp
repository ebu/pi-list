#include "ebu/list/st2110/d22/header.h"

using namespace ebu_list::st2110::d22;

header::header(cbyte_span data)
{
    assert(static_cast<size_t>(data.size()) >= sizeof(payload_header_));
    memcpy(payload_header_.data(), data.data(), sizeof(payload_header_));
}

// 0                               16                             32
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |T|K|L| I |F counter|     SEP counter     |     P counter       |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// !x * x  *x   *x*/x*        x*x*x*/x*x*x       *x*/x*x*x*x*

uint16_t header::get_p_counter()
{
    uint16_t v = 0;
    v += static_cast<uint8_t>(payload_header_[3]);
    v += static_cast<uint8_t>(payload_header_[2]) & 0x7;
    return v;
}

uint16_t header::get_sep_counter()
{
    uint16_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[2]) >> 3) & 0x1F;
    v += static_cast<uint8_t>(payload_header_[1]) & 0x3F;
    return v;
}

uint8_t header::get_f_counter()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[1]) >> 6) & 0x03;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x07) << 2;
    return v;
}

uint8_t header::get_interlaced()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x18) >> 3;
    return v;
}

uint8_t header::get_last()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x20) >> 5;
    return v;
}

uint8_t header::get_packetization_mode()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x40) >> 6;
    return v;
}

uint8_t header::get_transmission_mode()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x80) >> 7;
    return v;
}
//////////////////////////////////////////////////////////////////////
