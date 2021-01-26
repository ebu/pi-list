#pragma once

#include "ebu/list/analysis/serialization/common.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace st2110::d30
    {
        nlohmann::json to_json(const audio_description& desc);
        audio_description from_json(const nlohmann::json& j);
    } // namespace st2110::d30
} // namespace ebu_list

namespace ebu_list::analysis
{
    struct audio_stream_details : common_stream_details
    {
        st2110::d30::audio_description audio;

        uint32_t first_sample_ts = 0;
        uint32_t last_sample_ts  = 0;
        int packet_size        = 0;
        int samples_per_packet = 0;
        uint32_t sample_count  = 0;

        /** serialization details **/
        static audio_stream_details from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const audio_stream_details& details);
    };
} // namespace ebu_list::analysis
