#pragma once

#include "ebu/list/analysis/serialization/anc_serialization.h"
#include "ebu/list/analysis/serialization/audio_serialization.h"
#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/analysis/serialization/video_serialization.h"
#include "ebu/list/analysis/serialization/ttml_serialization.h"
#include <tuple>
#include <variant>

namespace ebu_list::analysis
{
    using media_stream_details =
        std::variant<video_stream_details,
                     audio_stream_details,
                     anc_stream_details,
                     ttml::stream_details>;

    using stream_with_details = std::pair<serializable_stream_info, media_stream_details>;

    struct stream_with_details_serializer
    {
        static stream_with_details from_json(const nlohmann::json& json_file);
        static nlohmann::json to_json(const stream_with_details& stream_info);
    };
} // namespace ebu_list::analysis
