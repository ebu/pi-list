#pragma once

#include "ebu/list/sdp/media_description.h"
#include "ebu/list/core/platform/guid.h"
#include <nlohmann/json.hpp>

namespace ebu_list
{
    namespace media
    {
        nlohmann::json to_json(const network_info& info);
        network_info from_json(const nlohmann::json& j);
    }

    enum class StreamState
    {
        NEEDS_INFO,
        READY,
        ANALYZED
    };
    std::string to_string(StreamState s);
    StreamState from_string(std::string_view s);

    struct serializable_stream_info : media::network_media_description
    {
        std::string id = newGuid().str();
        StreamState state = StreamState::NEEDS_INFO;
    };

    serializable_stream_info from_json(const nlohmann::json& j);
    nlohmann::json to_json(const serializable_stream_info& info);
}
