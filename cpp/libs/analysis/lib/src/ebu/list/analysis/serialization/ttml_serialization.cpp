#include "ebu/list/analysis/serialization/ttml_serialization.h"

using namespace ebu_list;
using namespace ebu_list::analysis::ttml;
using namespace std;

nlohmann::json stream_details::to_json(const stream_details& details)
{
    nlohmann::json statistics;
    analysis::to_json(statistics, static_cast<const common_stream_details&>(details));

    nlohmann::json j;
    j["media_specific"] = {};
    j["statistics"]     = statistics;

    return j;
}

stream_details stream_details::from_json(const nlohmann::json& j)
{
    stream_details desc{};

    const auto statistics_json = j.find("statistics");
    if(statistics_json != j.end())
    {
        analysis::from_json(*statistics_json, static_cast<common_stream_details&>(desc));
    }

    return desc;
}

nlohmann::json ttml::to_json(const ttml::description&)
{
    nlohmann::json j(nlohmann::json::value_t::object);
    return j;
}

ttml::description ttml::from_json(const nlohmann::json&)
{
    description desc{};
    return desc;
}
