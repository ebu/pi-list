#include "ebu/list/analysis/serialization/common.h"

using namespace ebu_list;
using nlohmann::json;

uint64_t to_nanoseconds(const clock::time_point& t)
{
    return std::chrono::duration_cast<std::chrono::nanoseconds>(t.time_since_epoch()).count();
}

void rtp::to_json(nlohmann::json& j, const rtp::packet_gap_info& elem)
{
    j                           = json::object();
    j["last_sequence_number"]   = std::to_string(elem.last_sequence_number);
    j["first_sequence_number"]  = std::to_string(elem.first_sequence_number);
    j["first_packet_timestamp"] = std::to_string(to_nanoseconds(elem.first_packet_timestamp));
}

void rtp::from_json(const nlohmann::json& j, packet_gap_info& p)
{
    const auto lsn           = j.at("last_sequence_number").get<std::string>();
    p.last_sequence_number   = std::stoi(lsn);
    const auto fsn           = j.at("first_sequence_number").get<std::string>();
    p.last_sequence_number   = std::stoi(fsn);
    const auto fpt           = j.at("first_packet_timestamp").get<std::string>();
    const uint64_t fpt_ns    = std::stoll(fpt);
    p.first_packet_timestamp = clock::time_point(std::chrono::nanoseconds(fpt_ns));
}

void rtp::to_json(nlohmann::json& j, const std::vector<rtp::packet_gap_info>& p)
{
    j = json::array();
    std::copy(begin(p), end(p), std::back_inserter(j));
}

void rtp::from_json(const nlohmann::json& j, std::vector<ebu_list::rtp::packet_gap_info>& p)
{
    p.clear();
    std::copy(begin(j), end(j), std::back_inserter(p));
}

void analysis::to_json(json& j, const common_stream_details& details)
{
    j["packet_count"]           = details.packet_count;
    j["retransmitted_packets"]  = details.retransmitted_packets;
    j["dropped_packet_count"]   = details.dropped_packet_count;
    j["dropped_packet_samples"] = details.dropped_packet_samples;
    j["first_packet_ts"]        = std::to_string(to_nanoseconds(details.first_packet_ts));
    j["last_packet_ts"]         = std::to_string(to_nanoseconds(details.last_packet_ts));
}

void analysis::from_json(const json& j, common_stream_details& details)
{
    details.packet_count          = j.at("packet_count").get<uint32_t>();
    details.retransmitted_packets = j.at("retransmitted_packets").get<uint32_t>();
    details.dropped_packet_count  = j.at("dropped_packet_count").get<uint32_t>();
    from_json(j["dropped_packet_samples"], details.dropped_packet_samples);
    details.first_packet_ts = clock::time_point{clock::duration{std::stol(j.at("first_packet_ts").get<std::string>())}};
    details.last_packet_ts  = clock::time_point{clock::duration{std::stol(j.at("last_packet_ts").get<std::string>())}};
}
