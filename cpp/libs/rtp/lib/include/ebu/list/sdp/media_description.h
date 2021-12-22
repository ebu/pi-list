#pragma once

#include "ebu/list/net/ethernet/mac.h"
#include "ebu/list/net/ipv4/decoder.h"
#include <string>
#include <vector>

namespace ebu_list::media
{
    enum class media_type
    {
        VIDEO,
        AUDIO,
        ANCILLARY_DATA,
        TTML,
        UNKNOWN
    };

    std::string to_string(media_type media_type);
    media_type from_string(std::string_view media);

    enum class full_media_type
    {
        RAW,
        JXSV,
        L16,
        L24,
        SMPTE291,
        TTMLXML,
        UNKNOWN
    };

    enum class transport_type
    {
        RIST,
        RTP,
        UNKNOWN
    };

    std::string full_media_to_string(full_media_type full_media_type);
    full_media_type full_media_from_string(std::string_view full_media);
    std::string full_transport_type_to_string(transport_type full_transport_type);
    transport_type full_transport_type_from_string(std::string_view full_media);
    bool is_full_media_type_video_raw(media::full_media_type full_media_type);
    bool is_full_media_type_video_jxsv(media::full_media_type full_media_type);
    bool is_full_media_type_video_smpte291(media::full_media_type full_media_type);
    bool is_full_media_type_audio_l16(media::full_media_type full_media_type);
    bool is_full_media_type_audio_l24(media::full_media_type full_media_type);
    bool is_full_media_type_ttml_xml(media::full_media_type full_media_type);
    bool is_full_media_type_unknown(media::full_media_type full_media_type);

    struct dscp_info
    {
        std::optional<ipv4::dscp_type> value; // the last value found
        bool is_consistent = true;            // true if always the same
    };

    struct inter_packet_spacing_t
    {
        clock::duration min{};
        clock::duration avg{};
        clock::duration max{};
    };

    struct inter_packet_spacing_info_t
    {
        inter_packet_spacing_t regular;
        inter_packet_spacing_t after_m_bit;
    };

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
        bool has_extended_header         = false;
        dscp_info dscp{};
        inter_packet_spacing_info_t inter_packet_spacing_info{};
    };

    struct network_media_description
    {
        network_info network;
        media_type type           = media_type::UNKNOWN;
        full_media_type full_type = full_media_type::UNKNOWN;
        transport_type full_transport_type = transport_type::UNKNOWN;

    };
} // namespace ebu_list::media
