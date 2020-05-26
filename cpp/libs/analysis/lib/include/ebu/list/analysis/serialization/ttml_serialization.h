#pragma once

#include "ebu/list/analysis/serialization/common.h"
#include "ebu/list/ttml/ttml_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list::ttml
{
    nlohmann::json to_json(const description& desc);
    description from_json(const nlohmann::json& j);
} // namespace ebu_list::ttml

namespace ebu_list::analysis::ttml
{
    struct stream_details : common_stream_details
    {
        static stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const stream_details& details);
    };
} // namespace ebu_list::analysis::ttml
