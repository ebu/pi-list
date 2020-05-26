#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/net/ipv4/address.h"
#include <array>

namespace ebu_list::ipv4
{
#pragma pack(push, 1)

    // from https://en.wikipedia.org/wiki/IPv4

    constexpr uint16_t IP_DF        = 0x4000; // dont fragment flag
    constexpr uint16_t IP_MF        = 0x2000; // more fragments flag
    constexpr uint16_t IP_MAXPACKET = 65535;  // maximum packet size

    struct packet_header
    {
        uint8_t ip_hl : 4; // header length
        uint8_t ip_v : 4;  // version

        uint8_t ip_ecn : 2;  // type of service
        uint8_t ip_dscp : 6; // type of service

        net_uint16_t ip_len; // total length

        net_uint16_t ip_id; // identification

        uint8_t ip_off_2 : 5; // fragment offset field
        uint8_t flags : 3;    // version

        uint8_t ip_off_1; // fragment offset field

        uint8_t ip_ttl; // time to live

        uint8_t ip_p; // protocol

        net_uint16_t ip_sum; // checksum

        ipv4::address ip_src; // source address

        ipv4::address ip_dst; // dest address
    };

    static_assert(sizeof(packet_header) == 20);

#pragma pack(pop)
} // namespace ebu_list::ipv4
