#include "ebu/list/serialization/anc_serialization.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list;
using namespace std;

nlohmann::json anc_stream_details::to_json(const anc_stream_details& details)
{
    nlohmann::json statistics;
    statistics["last_frame_ts"] = details.last_frame_ts;
    statistics["frame_count"] = details.frame_count;
    statistics["packet_count"] = details.packet_count;
    statistics["dropped_packet_count"] = details.dropped_packet_count;
    statistics["first_packet_ts"] = std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count());
    statistics["last_packet_ts"] = std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count());
    statistics["packets_per_frame"] = details.anc.packets_per_frame;

    nlohmann::json j;
    j["media_specific"] = st2110::d40::to_json(details.anc);
    j["statistics"] = statistics;

    return j;
}

anc_stream_details anc_stream_details::from_json(const nlohmann::json& j)
{
    anc_stream_details desc{};
    const auto anc_json = j.find("media_specific");
    if (anc_json != j.end())
    {
        desc.anc = st2110::d40::from_json(*anc_json);
    }

    const auto statistics_json = j.find("statistics");
    if (statistics_json != j.end())
    {
        desc.last_frame_ts = statistics_json->at("last_frame_ts").get<uint32_t>();
        desc.packet_count = statistics_json->at("packet_count").get<uint32_t>();
        desc.dropped_packet_count = statistics_json->at("dropped_packet_count").get<uint32_t>();
        desc.first_packet_ts = clock::time_point{ clock::duration{ std::stol(statistics_json->at("first_packet_ts").get<std::string>()) } };
        desc.last_packet_ts = clock::time_point{ clock::duration{ std::stol(statistics_json->at("last_packet_ts").get<std::string>()) } };
    }

    return desc;
}

nlohmann::json st2110::d40::to_json(const st2110::d40::anc_description& desc)
{
    nlohmann::json j;

    for(auto &it : desc.streams) {
        nlohmann::json stream;
        stream["num"] = it.num();
        stream["did_sdid"] = it.did_sdid();
        stream["errors"] = it.errors();
        j["streams"].push_back(stream);
    }

    return j;
}

st2110::d40::anc_description st2110::d40::from_json(const nlohmann::json& j)
{
    anc_description desc{};

    if (const auto dump = j.find("streams"); dump != j.end()) {
        for(auto it : j.at("streams")) {
            auto s = anc_stream(it.at("did_sdid"), it.at("num"));
            s.errors(it.at("errors"));
            desc.streams.push_back(s);
        }
    }

    return desc;
}
