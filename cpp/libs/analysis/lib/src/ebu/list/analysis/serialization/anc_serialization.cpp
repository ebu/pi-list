#include "ebu/list/analysis/serialization/anc_serialization.h"
#include "ebu/list/st2110/d40/packet.h"

using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d40;
using namespace ebu_list;
using namespace std;

nlohmann::json anc_stream_details::to_json(const anc_stream_details& details)
{
    nlohmann::json statistics;
    statistics["last_frame_ts"]        = details.last_frame_ts;
    statistics["frame_count"]          = details.frame_count;
    statistics["packet_count"]         = details.packet_count;
    statistics["dropped_packet_count"] = details.dropped_packet_count;
    statistics["wrong_marker_count"]   = details.wrong_marker_count;
    statistics["first_packet_ts"] =
        std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count());
    statistics["last_packet_ts"] =
        std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count());
    statistics["packets_per_frame"] = details.anc.packets_per_frame;

    nlohmann::json j;
    j["media_specific"] = st2110::d40::to_json(details.anc);
    j["statistics"]     = statistics;

    return j;
}

anc_stream_details anc_stream_details::from_json(const nlohmann::json& j)
{
    anc_stream_details desc{};
    const auto anc_json = j.find("media_specific");
    if(anc_json != j.end())
    {
        desc.anc = st2110::d40::from_json(*anc_json);
    }

    const auto statistics_json = j.find("statistics");
    if(statistics_json != j.end())
    {
        desc.last_frame_ts        = statistics_json->at("last_frame_ts").get<uint32_t>();
        desc.packet_count         = statistics_json->at("packet_count").get<uint32_t>();
        desc.dropped_packet_count = statistics_json->at("dropped_packet_count").get<uint32_t>();
        desc.wrong_marker_count   = statistics_json->at("wrong_marker_count").get<uint32_t>();
        desc.first_packet_ts =
            clock::time_point{clock::duration{std::stol(statistics_json->at("first_packet_ts").get<std::string>())}};
        desc.last_packet_ts =
            clock::time_point{clock::duration{std::stol(statistics_json->at("last_packet_ts").get<std::string>())}};
    }

    return desc;
}

nlohmann::json st2110::d40::to_json(const st2110::d40::anc_description& desc)
{
    nlohmann::json j;

    j["packets_per_frame"] = desc.packets_per_frame;
    j["rate"]              = to_string(desc.rate);
    j["scan_type"]         = to_string(desc.scan_type);
    for(auto& it : desc.sub_streams)
    {
        nlohmann::json sub_stream = to_json(it);
        j["sub_streams"].push_back(sub_stream);
    }

    return j;
}

nlohmann::json st2110::d40::to_json(const st2110::d40::anc_sub_stream& s)
{
    nlohmann::json j;
    j["num"]          = s.num();
    j["did_sdid"]     = s.did_sdid();
    j["line"]         = s.line_num();
    j["offset"]       = s.horizontal_offset();
    j["errors"]       = s.errors();
    j["packet_count"] = s.packet_count;

    for(auto& it : s.anc_sub_sub_streams)
    {
        nlohmann::json ss;
        ss["type"]     = it.type();
        ss["filename"] = it.filename();
        j["sub_sub_streams"].push_back(ss);
    }

    return j;
}

st2110::d40::anc_description st2110::d40::from_json(const nlohmann::json& j)
{
    anc_description desc{};

    desc.packets_per_frame = j.find("packets_per_frame")->get<int>();
    desc.rate              = media::video::parse_from_string(j.at("rate").get<string>());
    desc.scan_type         = media::video::parse_scan_type(j.find("scan_type")->get<string>());

    if(const auto dump = j.find("sub_streams"); dump != j.end())
    {
        for(auto it : j.at("sub_streams"))
        {
            anc_sub_stream s = from_json(it, 0); // TODO, fix this workaround
            desc.sub_streams.push_back(s);
        }
    }

    return desc;
}

st2110::d40::anc_sub_stream st2110::d40::from_json(const nlohmann::json& j, [[maybe_unused]] uint8_t i)
{
    raw_anc_packet_header anc_packet_header;
    anc_packet_header.did               = (j.at("did_sdid").get<int>() >> 8) & 0xff;
    anc_packet_header.sdid              = j.at("did_sdid").get<int>() & 0xff;
    anc_packet_header.stream_num        = j.at("num");
    anc_packet_header.line_num          = j.at("line");
    anc_packet_header.horizontal_offset = j.at("offset");
    const auto anc_packet               = anc_packet_header_lens(anc_packet_header);
    auto s                              = anc_sub_stream(anc_packet);

    s.errors(j.at("errors"));
    s.packet_count = j.at("packet_count");

    if(const auto dump = j.find("sub_sub_streams"); dump != j.end())
    {
        for(auto it : j.at("sub_sub_streams"))
        {
            auto ss = anc_sub_sub_stream(it.at("type").get<string>());
            s.anc_sub_sub_streams.push_back(ss);
        }
    }

    return s;
}
