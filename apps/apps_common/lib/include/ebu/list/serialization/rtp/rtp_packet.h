#pragma once

#include "nlohmann/json.hpp"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/serialization/video/frame.h"

namespace ebu_list
{
    struct rtp_packet : udp::datagram_info, ethernet::header
    {
        bool marker;
        uint8_t payload_type;
        uint16_t sequence_number;
        uint32_t timestamp;
        uint32_t ssrc;

        static rtp_packet build_from(const rtp::packet_info& packet);
        static nlohmann::json to_json(const rtp_packet& j);
        static rtp_packet from_json(const nlohmann::json& p);
    };
}
