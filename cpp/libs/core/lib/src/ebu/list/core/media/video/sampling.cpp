#include "ebu/list/core/media/video/sampling.h"
#include <stdexcept>

using namespace ebu_list::media;
using namespace ebu_list::media::video;

// todo: use dictionary for these!

std::string video::to_string(colorimetry c)
{
    switch (c)
    {
    case colorimetry::BT601: return "BT601";
    case colorimetry::BT709: return "BT709";
    case colorimetry::BT2020: return "BT2020";
    case colorimetry::BT2100: return "BT2100";
    case colorimetry::ST2065: return "ST2065-1";
    case colorimetry::ST2063: return "ST2065-3";
    case colorimetry::XYZ: return "XYZ";
    default: return "unknown";
    }
}

colorimetry video::parse_colorimetry(std::string_view s)
{
    if (s == "BT601")
        return colorimetry::BT601;
    else if (s == "BT709")
        return colorimetry::BT709;
    else if (s == "BT2020")
        return colorimetry::BT2020;
    else if (s == "BT2100")
        return colorimetry::BT2100;
    else if (s == "ST2065-1")
        return colorimetry::ST2065;
    else if (s == "ST2065-3")
        return colorimetry::ST2063;
    else if (s == "XYZ")
        return colorimetry::XYZ;
    else
        return colorimetry ::UNKNOWN;
}

//------------------------------------------------------------------------------

std::string video::to_string(video_sampling sampling)
{
    switch (sampling)
    {
    case video_sampling::YCbCr_4_2_0: return "YCbCr-4:2:0";
    case video_sampling::YCbCr_4_2_2: return "YCbCr-4:2:2";
    case video_sampling::YCbCr_4_4_4: return "YCbCr-4:4:4";
    case video_sampling::RGB_4_4_4: return "RGB";
    case video_sampling::XYZ_4_4_4: return "XYZ";
    default: return "unknown";
    }
}

video_sampling video::parse_video_sampling(std::string_view s)
{
    if (s == "YCbCr-4:2:0")
        return video_sampling::YCbCr_4_2_0;
    else if (s == "YCbCr-4:2:2")
        return video_sampling::YCbCr_4_2_2;
    else if (s == "YCbCr-4:4:4")
        return video_sampling::YCbCr_4_4_4;
    else if (s == "RGB")
        return video_sampling::RGB_4_4_4;
    else if (s == "XYZ")
        return video_sampling::XYZ_4_4_4;
    else
        return video_sampling::UNKNOWN;
}

float video::samples_per_pixel(video_sampling sampling)
{
    switch (sampling)
    {
    case video_sampling::YCbCr_4_2_0: return 1.5;
    case video_sampling::YCbCr_4_2_2: return 2;
    case video_sampling::YCbCr_4_4_4: return 3;
    case video_sampling::RGB_4_4_4: return 3;
    case video_sampling::XYZ_4_4_4: return 3;
    default: throw std::runtime_error("Sampling not valid");
    }
}
