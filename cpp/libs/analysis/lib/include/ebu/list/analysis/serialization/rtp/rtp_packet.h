#pragma once

#include "ebu/list/analysis/serialization/video/frame.h"
#include "ebu/list/rtp/decoder.h"
#include "nlohmann/json.hpp"

namespace ebu_list::analysis
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
} // namespace ebu_list::analysis
