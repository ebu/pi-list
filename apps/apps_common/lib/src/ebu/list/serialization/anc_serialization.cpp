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

    for(auto &it : desc.sub_streams) {
        nlohmann::json sub_stream = to_json(it);
        j["sub_streams"].push_back(sub_stream);
    }

    return j;
}

nlohmann::json st2110::d40::to_json(const st2110::d40::anc_sub_stream& s)
{
    nlohmann::json j;
    j["num"] = s.num();
    j["did_sdid"] = s.did_sdid();
    j["errors"] = s.errors();
    j["packet_count"] = s.packet_count;

    for(auto &it : s.anc_sub_sub_streams) {
        nlohmann::json ss;
        ss["type"] = it.type();
        ss["filename"] = it.filename();
        j["sub_sub_streams"].push_back(ss);
    }

    return j;
}

st2110::d40::anc_description st2110::d40::from_json(const nlohmann::json& j)
{
    anc_description desc{};

    if (const auto dump = j.find("sub_streams"); dump != j.end()) {
        for(auto it : j.at("sub_streams")) {
            anc_sub_stream s = from_json(it, 0); //TODO, fix this workaround
            desc.sub_streams.push_back(s);
        }
    }

    return desc;
}

st2110::d40::anc_sub_stream st2110::d40::from_json(const nlohmann::json& j, uint8_t i)
{
    auto s = anc_sub_stream(j.at("did_sdid"), j.at("num"));
    s.errors(j.at("errors"));
    s.packet_count = j.at("packet_count");

    if (const auto dump = j.find("sub_sub_streams"); dump != j.end()) {
        for(auto it : j.at("sub_sub_streams")) {
            auto ss = anc_sub_sub_stream(it.at("type").get<string>());
            s.anc_sub_sub_streams.push_back(ss);
        }
    }

    return s;
}
