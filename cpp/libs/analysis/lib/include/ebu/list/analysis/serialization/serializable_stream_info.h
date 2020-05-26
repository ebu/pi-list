#pragma once

#include "ebu/list/core/platform/guid.h"
#include "ebu/list/sdp/media_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace media
    {
        void to_json(nlohmann::json& j, const dscp_info& p);
        void from_json(const nlohmann::json& j, dscp_info& p);
        nlohmann::json to_json(const network_info& info);
        network_info from_json(const nlohmann::json& j);
    } // namespace media
} // namespace ebu_list

namespace ebu_list::analysis
{
    enum class stream_state
    {
        NEEDS_INFO,
        READY,
        ON_GOING_ANALYSIS,
        ANALYZED
    };
    std::string to_string(stream_state s);
    stream_state from_string(std::string_view s);

    struct serializable_stream_info : media::network_media_description
    {
        std::string id     = newGuid().str();
        std::string pcap   = "";
        stream_state state = stream_state::NEEDS_INFO;

        /** serialization details **/
        static serializable_stream_info from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const serializable_stream_info& info);
    };

} // namespace ebu_list::analysis
