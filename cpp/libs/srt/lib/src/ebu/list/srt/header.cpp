#include "ebu/list/srt/header.h"

using namespace ebu_list::srt;

header::header(cbyte_span data)
{
    assert(static_cast<size_t>(data.size()) >= sizeof(payload_header_));
    memcpy(payload_header_.data(), data.data(), sizeof(payload_header_));
}

uint32_t header::get_packet_sequence_number()
{
    uint32_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[3]));
    v += (static_cast<uint8_t>(payload_header_[2])) << 8;
    v += (static_cast<uint8_t>(payload_header_[1])) << 16;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x7F) << 24;
    return v;
}

uint8_t header::get_packet_type_flag()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[0]) & 0x80) >> 7;
    return v;
}

uint32_t header::get_message_number()
{
    uint32_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[7]));
    v += (static_cast<uint8_t>(payload_header_[6])) << 8;
    v += (static_cast<uint8_t>(payload_header_[5])) << 16;
    v += (static_cast<uint8_t>(payload_header_[4]) & 0x03) << 24;
    return v;
}

uint8_t header::get_retransmission_flag()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[4]) & 0x04) >> 2;
    return v;
}

uint8_t header::get_encryption_flag()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[4]) & 0x18) >> 3;
    return v;
}

uint8_t header::get_order_flag()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[4]) & 0x20) >> 5;
    return v;
}

uint8_t header::get_packet_position_flag()
{
    uint8_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[4]) & 0xC0) >> 6;
    return v;
}

uint32_t header::get_timestamp()
{
    uint32_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[11]));
    v += (static_cast<uint8_t>(payload_header_[10])) << 8;
    v += (static_cast<uint8_t>(payload_header_[9])) << 16;
    v += (static_cast<uint8_t>(payload_header_[8])) << 24;
    return v;
}

uint32_t header::get_destination_socket_id()
{
    uint32_t v = 0;
    v += (static_cast<uint8_t>(payload_header_[15]));
    v += (static_cast<uint8_t>(payload_header_[14])) << 8;
    v += (static_cast<uint8_t>(payload_header_[13])) << 16;
    v += (static_cast<uint8_t>(payload_header_[12])) << 24;
    return v;
}
//////////////////////////////////////////////////////////////////////
