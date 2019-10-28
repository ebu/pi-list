#pragma once

#include "ebu/list/core/media/video/dimensions.h"
#include "ebu/list/core/media/video/sampling.h"

namespace ebu_list::media::video
{
    using Rate = fraction;

    /**
     * Convert a string representation to a valid rate.
     * It throws if the rate is unknown/not supported
     */
    Rate parse_from_string(std::string_view s);

    enum class scan_type
    {
        PROGRESSIVE,
        INTERLACED
    };

    std::string to_string(scan_type scan);
    scan_type parse_scan_type(std::string_view s);

    struct info
    {
        Rate rate;
        scan_type scan;
        video_dimensions raster;
    };
} // namespace ebu_list::media::video
