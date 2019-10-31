#include "ebu/list/analysis/serialization/analysis_profile.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using nlohmann::json;

void analysis::from_json(const json& j, analysis_profile& p)
{
    j.at("id").get_to(p.id);
    j.at("label").get_to(p.label);
    j.at("timestamps").get_to(p.timestamps);
}

void analysis::from_json(const json& j, timestamps_t& p)
{
    j.at("source").get_to(p.source);
}

void analysis::from_json(const json& j, timestamps_source& t)
{
    const auto v = j.get<std::string>();

    if(v == "pcap")
    {
        t = timestamps_source::pcap;
    }
    else
    {
        LIST_ENFORCE(v == "ptp_packets", std::runtime_error, "Unknown timestamp source: {}", v);
        t = timestamps_source::ptp_packets;
    }
}
