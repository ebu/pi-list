#pragma once

#include "ebu/list/core/math.h"
#include <cstdint>

namespace ebu_list::media::video
{
    struct video_dimensions
    {
        uint16_t width;
        uint16_t height;
    };

    std::string to_string(video_dimensions raster);

    constexpr video_dimensions build_1920x1080()
    {
        return video_dimensions{1920, 1080};
    }

    constexpr video_dimensions build_1280x720()
    {
        return video_dimensions{1280, 720};
    }
} // namespace ebu_list::media::video
