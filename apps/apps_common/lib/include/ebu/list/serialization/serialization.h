#pragma once

#include "serializable_stream_info.h"
#include "video_serialization.h"
#include "audio_serialization.h"

#include "ebu/list/serialization/utils.h"
#include "ebu/list/constants.h"

namespace ebu_list
{
    template<class T>
    void write_stream_info(const path& dir, const serializable_stream_info& info, const T& details)
    {
        auto j = to_json(info);
        j.merge_patch(to_json(details));

        write_json_to(dir / info.id, constants::meta_filename, j);
    }
}