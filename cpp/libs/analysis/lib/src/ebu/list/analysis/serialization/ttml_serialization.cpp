#include "ebu/list/analysis/serialization/ttml_serialization.h"

using namespace ebu_list;
using namespace ebu_list::analysis::ttml;
using namespace std;

nlohmann::json stream_details::to_json(const stream_details& details)
{
    nlohmann::json statistics;
    statistics["packet_count"] = details.packet_count;
    statistics["dropped_packet_count"] = details.dropped_packet_count;
    statistics["first_packet_ts"] =
        std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count());
    statistics["last_packet_ts"] =
        std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count());

    nlohmann::json j;
    j["media_specific"] = {};
    j["statistics"] = statistics;

    return j;
}

stream_details stream_details::from_json(const nlohmann::json& j)
{
    stream_details desc{};

    const auto statistics_json = j.find("statistics");
    if(statistics_json != j.end())
    {
        desc.packet_count = statistics_json->at("packet_count").get<uint32_t>();
        desc.dropped_packet_count = statistics_json->at("dropped_packet_count").get<uint32_t>();
        desc.first_packet_ts =
            clock::time_point{clock::duration{std::stol(statistics_json->at("first_packet_ts").get<std::string>())}};
        desc.last_packet_ts =
            clock::time_point{clock::duration{std::stol(statistics_json->at("last_packet_ts").get<std::string>())}};
    }

    return desc;
}

nlohmann::json ttml::to_json(const ttml::description&)
{
    nlohmann::json j(nlohmann::json::value_t::object);
    return j;
}

ttml::description ttml::from_json(const nlohmann::json&)
{
    description desc{};
    return desc;
}
