#include "ebu/list/serialization/serializable_stream_info.h"

using namespace ebu_list;
using namespace std;

serializable_stream_info serializable_stream_info::from_json(const nlohmann::json& j)
{
    serializable_stream_info stream;
    stream.id = j["id"].get<string>();
    stream.pcap = j["pcap"].get<string>();
    stream.state = from_string(j["state"].get<string>());
    stream.type = media::from_string(j["media_type"].get<string>());
    stream.network = media::from_json(j.at("network_information"));

    return stream;
}

nlohmann::json serializable_stream_info::to_json(const serializable_stream_info& info)
{
    nlohmann::json j;
    j["id"] = info.id;
    j["pcap"] = info.pcap;
    j["state"] = to_string(info.state);
    j["media_type"] = to_string(info.type);
    j["network_information"] = media::to_json(info.network);

    return j;
}

std::string ebu_list::to_string(StreamState s)
{
    switch(s)
    {
        case StreamState::NEEDS_INFO: return "needs_info";
        case StreamState::READY: return "ready";
        case StreamState::ON_GOING_ANALYSIS: return "on_going_analysis";
        default:
        {
            assert(s == StreamState::ANALYZED);
            return "analyzed";
        }
    }
}

StreamState ebu_list::from_string(std::string_view s)
{
    if (s == "needs_info")
    {
        return StreamState::NEEDS_INFO;
    }
    else if (s == "ready")
    {
        return StreamState::READY;
    }
    else if (s == "on_going_analysis")
    {
        return StreamState::ON_GOING_ANALYSIS;
    }
    else
    {
        assert(s == "analyzed");
        return StreamState::ANALYZED;
    }
}

nlohmann::json media::to_json(const media::network_info& info)
{
    nlohmann::json j;
    j["source_address"] = to_string(info.source.addr);
    j["source_port"] = to_string(info.source.p);
    j["destination_address"] = to_string(info.destination.addr);
    j["destination_port"] = to_string(info.destination.p);
    j["ssrc"] = info.ssrc;
    j["payload_type"] = info.payload_type;

    return j;
}

media::network_info media::from_json(const nlohmann::json& j)
{
    network_info stream;
    stream.source = ipv4::from_string(j.at("source_address").get<string>(), j.at("source_port").get<string>());
    stream.destination = ipv4::from_string(j.at("destination_address").get<string>(), j.at("destination_port").get<string>());
    stream.ssrc = j.at("ssrc").get<uint32_t>();
    stream.payload_type = j.at("payload_type").get<uint16_t>();

    return stream;
}
