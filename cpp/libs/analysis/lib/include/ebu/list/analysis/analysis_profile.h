#pragma once

#include "nlohmann/json.hpp"

namespace ebu_list::analysis
{
    enum class timestamps_source
    {
        pcap,
        ptp_packets
    };

    struct timestamps_t
    {
        timestamps_source source;
    };

    struct analysis_profile
    {
        std::string id;
        std::string label;
        timestamps_t timestamps;
    };

    void from_json(const nlohmann::json& j, analysis_profile& p);
    void from_json(const nlohmann::json& j, timestamps_t& p);
    void from_json(const nlohmann::json& j, timestamps_source& p);
} // namespace ebu_list::analysis
