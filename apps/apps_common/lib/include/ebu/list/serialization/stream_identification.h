#pragma once

#include "ebu/list/serialization/serializable_stream_info.h"
#include "ebu/list/serialization/video_serialization.h"
#include "ebu/list/serialization/audio_serialization.h"
#include "ebu/list/serialization/anc_serialization.h"

#include <variant>
#include <tuple>

namespace ebu_list
{
    using media_stream_details = std::variant<video_stream_details, audio_stream_details, anc_stream_details>;
    using stream_with_details = std::pair<serializable_stream_info, media_stream_details>;

    struct stream_with_details_serializer
    {
        static stream_with_details from_json(const nlohmann::json& json_file);
        static nlohmann::json to_json(const stream_with_details& stream_info);
    };
}
