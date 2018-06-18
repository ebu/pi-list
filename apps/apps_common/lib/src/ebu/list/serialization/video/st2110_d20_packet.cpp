#include "ebu/list/serialization/video/st2110_d20_packet.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;

nlohmann::json st2110_d20_packet::to_json(const st2110_d20_packet& p)
{
    nlohmann::json j = rtp_packet::to_json(p.rtp);
    j["extended_sequence_number"] = p.full_sequence_number;
    j["lines"] = ebu_list::to_json(p.line_info);

    return j;
}

st2110_d20_packet st2110_d20_packet::from_json(const nlohmann::json& j)
{
    const auto ext_seq_num = j["extended_sequence_number"].get<uint32_t>();
    const auto lines_j = j["lines"];

    lines_info lines;
    LIST_ENFORCE( lines_j.size() <= lines.size(), std::invalid_argument, "Only three lines per packet allowed by ST2110-20");

    for(auto i = 0; i < lines_j.size(); i++)
    {
        lines[i] = line_info::from_json(lines_j[i]);
    }

    return { rtp_packet::from_json(j), ext_seq_num, lines};
}
