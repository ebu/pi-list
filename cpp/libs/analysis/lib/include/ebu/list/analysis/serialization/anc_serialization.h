#pragma once

#include "ebu/list/analysis/serialization/common.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace st2110::d40
    {
        nlohmann::json to_json(const anc_description& desc);
        nlohmann::json to_json(const anc_sub_stream& s);
        anc_description from_json(const nlohmann::json& j);
        anc_sub_stream from_json(const nlohmann::json& j, uint8_t i);
    } // namespace st2110::d40
} // namespace ebu_list

namespace ebu_list::analysis
{
    struct anc_stream_details : common_stream_details
    {
        st2110::d40::anc_description anc;

        uint32_t wrong_field_count    = 0;
        uint32_t wrong_marker_count   = 0;
        uint32_t payload_error_count  = 0;
        uint32_t frame_count          = 0; // frame concept applies to ancillary too
        uint32_t last_frame_ts        = 0;

        /* serialization details */
        static anc_stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const anc_stream_details& details);
    };
} // namespace ebu_list::analysis
