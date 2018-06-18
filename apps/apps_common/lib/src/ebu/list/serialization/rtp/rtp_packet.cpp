#include "ebu/list/serialization/rtp/rtp_packet.h"

using namespace ebu_list;

nlohmann::json rtp_packet::to_json(const rtp_packet& packet)
{
    nlohmann::json j;
    j["rtp_timestamp"] = packet.timestamp;
    j["marker"] = packet.marker;
    j["payload_type"] = packet.payload_type;
    j["sequence_number"] = packet.sequence_number;
    j["ssrc"] = packet.ssrc;

    // UDP stuff
    j["packet_time"] = packet.packet_time.time_since_epoch().count();
    j["destination_address"] = to_string(packet.destination_address);
    j["destination_port"] = to_native(packet.destination_port);
    j["source_address"] = to_string(packet.source_address);
    j["source_port"] = to_native(packet.source_port);
    j["datagram_size"] = packet.datagram_size;

    return j;
}

rtp_packet rtp_packet::from_json(const nlohmann::json& j)
{
    rtp_packet p;

    // UDP
    clock::duration count { j.at("packet_time").get<long>() };
    p.packet_time = clock::time_point{count};
    p.destination_address = ipv4::from_dotted_string(j.at("destination_address").get<std::string>());
    p.destination_port = to_port(j.at("destination_port").get<uint16_t>());
    p.source_address = ipv4::from_dotted_string(j.at("source_address").get<std::string>());
    p.source_port = to_port(j.at("source_port").get<uint16_t>());
    p.datagram_size = j.at("datagram_size").get<size_t>();
    p.type = ipv4::protocol_type::UDP; // todo: de-hardcode if we ever support more protocols

    // RTP
    p.timestamp = j.at("rtp_timestamp");
    p.marker = j.at("marker").get<bool>();
    p.payload_type = j.at("payload_type").get<uint8_t>();
    p.sequence_number = j.at("sequence_number").get<uint16_t>();
    p.ssrc = j.at("ssrc").get<uint32_t>();



    return p;
}

rtp_packet rtp_packet::build_from(const rtp::packet_info& packet)
{
    rtp_packet p;

    // UDP
    p.packet_time = packet.udp.packet_time;
    p.destination_address = packet.udp.destination_address;
    p.destination_port = packet.udp.destination_port;
    p.source_address = packet.udp.source_address;
    p.source_port = packet.udp.source_port;
    p.datagram_size = packet.udp.datagram_size;
    p.type = packet.udp.type;

    // RTP
    const auto rtp_part = packet.rtp.view();
    p.timestamp = rtp_part.timestamp();
    p.marker = rtp_part.marker();
    p.payload_type = rtp_part.payload_type();
    p.sequence_number = rtp_part.sequence_number();
    p.ssrc = rtp_part.ssrc();

    return p;
}
