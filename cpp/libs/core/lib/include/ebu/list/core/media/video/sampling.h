#pragma once

#include <string>

namespace ebu_list::media::video
{
    enum class colorimetry
    {
        BT601,
        BT709,
        BT2020,
        BT2100,
        ST2065,
        ST2063,
        XYZ,
        UNKNOWN
    };
    std::string to_string(colorimetry c);
    colorimetry parse_colorimetry(std::string_view s);

    enum class video_sampling
    {
        YCbCr_4_4_4,
        YCbCr_4_2_2,
        YCbCr_4_2_0,
        RGB_4_4_4,
        XYZ_4_4_4,
        UNKNOWN
    };

    video_sampling parse_video_sampling(std::string_view s);
    std::string to_string(video_sampling sampling);

    float samples_per_pixel(video_sampling sampling);
}