#pragma once

#include "ebu/list/st2110/d40/anc_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace st2110::d40
    {
        nlohmann::json to_json(const anc_description& desc);
        anc_description from_json(const nlohmann::json& j);
    }

    struct anc_stream_details
    {
        st2110::d40::anc_description anc;

        unsigned long frame_count = 0;

        /* serialization details */
        static anc_stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const anc_stream_details& details);
    };
}
