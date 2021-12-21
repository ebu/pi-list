#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/rtp/sequence_number_analyzer.h"
#include "nlohmann/json.hpp"
#include <vector>

namespace ebu_list::rtp
{
    void to_json(nlohmann::json& j, const packet_gap_info& p);
    void from_json(const nlohmann::json& j, packet_gap_info& p);
    void to_json(nlohmann::json& j, const std::vector<ebu_list::rtp::packet_gap_info>& p);
    void from_json(const nlohmann::json& j, std::vector<ebu_list::rtp::packet_gap_info>& p);
} // namespace ebu_list::rtp

namespace ebu_list::analysis
{
    struct common_stream_details
    {
        uint64_t packet_count         = 0;
        uint64_t dropped_packet_count = 0;
        std::vector<rtp::packet_gap_info> dropped_packet_samples{};
        clock::time_point first_packet_ts{};
        clock::time_point last_packet_ts{};
        uint32_t retransmitted_packets{};
    };

    void to_json(nlohmann::json& j, const common_stream_details& p);
    void from_json(const nlohmann::json& j, common_stream_details& p);
} // namespace ebu_list::analysis
