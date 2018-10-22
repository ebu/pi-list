#include "ebu/list/serialization/anc_serialization.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list;
using namespace std;

nlohmann::json anc_stream_details::to_json(const anc_stream_details& details)
{
    nlohmann::json statistics;
    statistics["frame_count"] = details.frame_count;

    nlohmann::json j;
    j["media_specific"] = st2110::d40::to_json(details.anc);
    j["statistics"] = statistics;

    return j;
}

anc_stream_details anc_stream_details::from_json(const nlohmann::json& j)
{
    anc_stream_details desc{};
    desc.anc = st2110::d40::from_json(j.at("media_specific"));
    return desc;
}

nlohmann::json st2110::d40::to_json(const st2110::d40::anc_description& desc)
{
    nlohmann::json j;

    for(auto &it : desc.streams) {
        nlohmann::json stream;
        stream["num"] = it.num();
        stream["did_sdid"] = it.did_sdid();
        j["streams"].push_back(stream);
    }

    return j;
}

st2110::d40::anc_description st2110::d40::from_json(const nlohmann::json& j)
{
    anc_description desc{};

    for(auto it : j.at("streams")) {
        auto s = anc_stream(it.at("did_sdid"), it.at("num"));
        desc.streams.push_back(s);
    }

    return desc;
}
