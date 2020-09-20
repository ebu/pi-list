#include "ebu/list/analysis/serialization/serializable_stream_info.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::media;
using namespace std;
using nlohmann::json;

serializable_stream_info serializable_stream_info::from_json(const json& j)
{
    serializable_stream_info stream;
    stream.id      = j["id"].get<string>();
    stream.pcap    = j["pcap"].get<string>();
    stream.state   = from_string(j["state"].get<string>());
    stream.type    = media::from_string(j["media_type"].get<string>());
    stream.network = media::from_json(j.at("network_information"));

    return stream;
}

json serializable_stream_info::to_json(const serializable_stream_info& info)
{
    json j;
    j["id"]                  = info.id;
    j["pcap"]                = info.pcap;
    j["state"]               = to_string(info.state);
    j["media_type"]          = to_string(info.type);
    j["network_information"] = media::to_json(info.network);

    return j;
}

std::string analysis::to_string(stream_state s)
{
    switch(s)
    {
    case stream_state::NEEDS_INFO: return "needs_info";
    case stream_state::READY: return "ready";
    case stream_state::ON_GOING_ANALYSIS: return "on_going_analysis";
    default: {
        assert(s == stream_state::ANALYZED);
        return "analyzed";
    }
    }
}

stream_state analysis::from_string(std::string_view s)
{
    if(s == "needs_info")
    {
        return stream_state::NEEDS_INFO;
    }
    else if(s == "ready")
    {
        return stream_state::READY;
    }
    else if(s == "on_going_analysis")
    {
        return stream_state::ON_GOING_ANALYSIS;
    }
    else
    {
        assert(s == "analyzed");
        return stream_state::ANALYZED;
    }
}

void media::to_json(json& j, const dscp_info& dscp)
{
    j["consistent"] = dscp.is_consistent;
    if(dscp.value)
    {
        j["value"] = dscp.value.value();
    }
}

void media::from_json(const json& j, dscp_info& dscp)
{
    if(const auto consistent = j.find("consistent"); consistent != j.end())
    {
        dscp.is_consistent = j.at("consistent").get<bool>();
    }

    if(const auto value = j.find("value"); value != j.end())
    {
        dscp.value = static_cast<ipv4::dscp_type>(j.at("value").get<uint8_t>());
    }
}

void media::to_json(nlohmann::json& j, const inter_packet_spacing_info_t& info)
{
    j["regular"] = info.regular;
    j["after_m_bit"] = info.after_m_bit;
}

void media::from_json(const nlohmann::json& j, inter_packet_spacing_info_t& info)
{
    if(const auto it = j.find("regular"); it != j.end())
    {
        from_json(*it, info.regular);
    }

    if(const auto it = j.find("after_m_bit"); it != j.end())
    {
        from_json(*it, info.after_m_bit);
    }
}

void media::to_json(nlohmann::json& j, const inter_packet_spacing_t& info)
{
    j["max"] = std::chrono::duration_cast<std::chrono::nanoseconds>(info.max).count();
    j["avg"] = std::chrono::duration_cast<std::chrono::nanoseconds>(info.avg).count();
    j["min"] = std::chrono::duration_cast<std::chrono::nanoseconds>(info.min).count();
}

void media::from_json(const nlohmann::json& j, inter_packet_spacing_t& info)
{
    if(const auto it = j.find("max"); it != j.end())
    {
        info.max = std::chrono::nanoseconds(it->get<uint64_t>());
    }

    if(const auto it = j.find("avg"); it != j.end())
    {
        info.avg = std::chrono::nanoseconds(it->get<uint64_t>());
    }

    if(const auto it = j.find("min"); it != j.end())
    {
        info.min = std::chrono::nanoseconds(it->get<uint64_t>());
    }
}

json media::to_json(const media::network_info& info)
{
    json j;
    j["source_mac_address"]          = ethernet::to_string(info.source_mac);
    j["source_address"]              = to_string(info.source.addr);
    j["source_port"]                 = to_string(info.source.p);
    j["destination_mac_address"]     = ethernet::to_string(info.destination_mac);
    j["destination_address"]         = to_string(info.destination.addr);
    j["destination_port"]            = to_string(info.destination.p);
    j["ssrc"]                        = info.ssrc;
    j["payload_type"]                = info.payload_type;
    j["valid_multicast_mac_address"] = info.valid_multicast_mac_address;
    j["valid_multicast_ip_address"]  = info.valid_multicast_ip_address;
    j["multicast_address_match"]     = info.multicast_address_match;
    j["has_extended_header"]         = info.has_extended_header;
    j["inter_packet_spacing"]        = info.inter_packet_spacing_info;

    json dscp;
    to_json(dscp, info.dscp);
    j["dscp"] = dscp;

    return j;
}

media::network_info media::from_json(const json& j)
{
    network_info stream;

    const auto src_mac_addr_key = j.find("source_mac_address");
    if(src_mac_addr_key != j.end())
        stream.source_mac = ethernet::to_mac_address(src_mac_addr_key->get<string>()).value();

    stream.source = ipv4::from_string(j.at("source_address").get<string>(), j.at("source_port").get<string>());

    const auto dst_mac_addr_key = j.find("destination_mac_address");
    if(dst_mac_addr_key != j.end())
        stream.destination_mac = ethernet::to_mac_address(dst_mac_addr_key->get<string>()).value();

    stream.destination =
        ipv4::from_string(j.at("destination_address").get<string>(), j.at("destination_port").get<string>());

    stream.ssrc         = j.at("ssrc").get<uint32_t>();
    stream.payload_type = j.at("payload_type").get<uint16_t>();

    const auto valid_mcast_mac_addr_key = j.find("valid_multicast_mac_address");
    if(valid_mcast_mac_addr_key != j.end()) stream.valid_multicast_mac_address = valid_mcast_mac_addr_key->get<bool>();

    const auto valid_mcast_ip_addr_key = j.find("valid_multicast_ip_address");
    if(valid_mcast_ip_addr_key != j.end()) stream.valid_multicast_ip_address = valid_mcast_ip_addr_key->get<bool>();

    const auto mcast_addr_match_key = j.find("multicast_address_match");
    if(mcast_addr_match_key != j.end()) stream.multicast_address_match = mcast_addr_match_key->get<bool>();

    const auto has_extended_header_key = j.find("has_extended_header");
    if(has_extended_header_key != j.end()) stream.has_extended_header = has_extended_header_key->get<bool>();

    from_json(j, stream.dscp);

    const auto inter_packet_spacing_info = j.find("inter_packet_spacing");
    if(inter_packet_spacing_info != j.end())
    {
        from_json(*inter_packet_spacing_info, stream.inter_packet_spacing_info);
    }

    return stream;
}
