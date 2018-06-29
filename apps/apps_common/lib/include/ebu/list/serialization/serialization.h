#pragma once

#include "serializable_stream_info.h"
#include "video_serialization.h"
#include "audio_serialization.h"
#include "ebu/list/serialization/utils.h"
#include "ebu/list/serialization/compliance.h"
#include "ebu/list/constants.h"

namespace ebu_list
{
    template<class T>
    void write_stream_info(const path& dir, const serializable_stream_info& info, const T& details)
    {
        auto j = serializable_stream_info::to_json(info);
        j.merge_patch(T::to_json(details));

        write_json_to(dir / info.id, constants::meta_filename, j);
    }

    void write_stream_info(const path& dir, const serializable_stream_info& info, const video_stream_details& details, const st2110::d21::video_analysis_info& vai)
    {
        auto j = serializable_stream_info::to_json(info);
        j.merge_patch(video_stream_details::to_json(details));
        j["global_video_analysis"] = nlohmann::json(vai);

        write_json_to(dir / info.id, constants::meta_filename, j);
    }
}