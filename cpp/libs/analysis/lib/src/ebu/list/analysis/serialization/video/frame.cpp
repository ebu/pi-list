#include "ebu/list/analysis/serialization/video/frame.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::analysis;

nlohmann::json frame_info::to_json(const frame_info& info)
{
    nlohmann::json j;
    j["timestamp"]       = info.timestamp;
    j["packet_count"]    = info.packet_count;
    j["first_packet_ts"] = info.first_packet_timestamp;
    j["last_packet_ts"]  = info.last_packet_timestamp;

    return j;
}

frame_info frame_info::from_json(const nlohmann::json& j)
{
    frame_info f;
    f.timestamp              = j["timestamp"].get<uint32_t>();
    f.packet_count           = j["packet_count"].get<size_t>();
    f.first_packet_timestamp = j["first_packet_ts"].get<int64_t>();
    f.last_packet_timestamp  = j["last_packet_ts"].get<int64_t>();

    return f;
}

nlohmann::json line_info::to_json(const line_info& line)
{
    LIST_ASSERT(line.valid);
    nlohmann::json j;
    j["line_number"]          = line.line_number;
    j["length"]               = line.length;
    j["offset"]               = line.offset;
    j["field_identification"] = line.field_identification;
    j["continuation"]         = line.continuation;

    return j;
}

line_info line_info::from_json(const nlohmann::json& j)
{
    line_info l;
    l.line_number          = j["line_number"].get<uint16_t>();
    l.length               = j["length"].get<uint16_t>();
    l.offset               = j["offset"].get<uint16_t>();
    l.field_identification = j["field_identification"].get<uint8_t>();
    l.continuation         = j["continuation"].get<bool>();
    l.valid                = true;

    return l;
}

nlohmann::json analysis::to_json(const lines_info& lines)
{
    nlohmann::json j;
    for (const auto& line : lines)
    {
        if (line.valid)
        {
            j.push_back(line_info::to_json(line));
        }
    }

    return j;
}
