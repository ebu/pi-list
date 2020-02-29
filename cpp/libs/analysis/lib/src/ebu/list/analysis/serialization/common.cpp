#include "ebu/list/analysis/serialization/common.h"

using namespace ebu_list;
using nlohmann::json;

void analysis::to_json(json& j, const common_stream_details& details)
{
    j["packet_count"]         = details.packet_count;
    j["dropped_packet_count"] = details.dropped_packet_count;
    j["first_packet_ts"]      = std::to_string(
        std::chrono::duration_cast<std::chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count());
    j["last_packet_ts"] = std::to_string(
        std::chrono::duration_cast<std::chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count());
}

void analysis::from_json(const json& j, common_stream_details& details)
{
    details.packet_count         = j.at("packet_count").get<uint32_t>();
    details.dropped_packet_count = j.at("dropped_packet_count").get<uint32_t>();
    details.first_packet_ts = clock::time_point{clock::duration{std::stol(j.at("first_packet_ts").get<std::string>())}};
    details.last_packet_ts  = clock::time_point{clock::duration{std::stol(j.at("last_packet_ts").get<std::string>())}};
}
