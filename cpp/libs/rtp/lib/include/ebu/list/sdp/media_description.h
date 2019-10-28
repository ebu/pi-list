#pragma once

#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/net/ipv4/address.h"
#include <string>
#include <vector>

namespace ebu_list::media
{
    enum class media_type
    {
        VIDEO,
        AUDIO,
        ANCILLARY_DATA,
        UNKNOWN
    };

    std::string to_string(media_type media_type);
    media_type from_string(std::string_view media);

    struct network_info
    {
        ethernet::mac_address source_mac      = to_byte_array(0, 0, 0, 0, 0, 0);
        ethernet::mac_address destination_mac = to_byte_array(0, 0, 0, 0, 0, 0);
        ipv4::endpoint source{};
        ipv4::endpoint destination{};
        uint16_t payload_type            = 0;
        uint32_t ssrc                    = 0;
        bool valid_multicast_mac_address = true;
        bool valid_multicast_ip_address  = true;
        bool multicast_address_match     = true;
    };

    struct network_media_description
    {
        network_info network;
        media_type type = media_type::UNKNOWN;
    };
} // namespace ebu_list::media
