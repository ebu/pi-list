#pragma once

#include "ebu/list/core/platform/guid.h"
#include "ebu/list/sdp/media_description.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    namespace media
    {
        nlohmann::json to_json(const network_info& info);
        network_info from_json(const nlohmann::json& j);
    } // namespace media
} // namespace ebu_list

namespace ebu_list::analysis
{
    enum class StreamState
    {
        NEEDS_INFO,
        READY,
        ON_GOING_ANALYSIS,
        ANALYZED
    };
    std::string to_string(StreamState s);
    StreamState from_string(std::string_view s);

    struct serializable_stream_info : media::network_media_description
    {
        std::string id    = newGuid().str();
        std::string pcap  = "";
        StreamState state = StreamState::NEEDS_INFO;

        /** serialization details **/
        static serializable_stream_info from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const serializable_stream_info& info);
    };

} // namespace ebu_list::analysis
