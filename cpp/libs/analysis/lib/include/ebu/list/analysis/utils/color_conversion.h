#pragma once

#include "ebu/list/core/media/video/dimensions.h"
#include "ebu/list/core/memory/bimo.h"

namespace ebu_list::analysis
{
    // todo: generalize and move this to core

    bisect::bimo::oview from_ycbcr422_to_rgba(oview ycbcr422, media::video::video_dimensions dimensions);
    bisect::bimo::oview from_ycbcr422_to_uyvy(oview ycbcr422, media::video::video_dimensions dimensions);
} // namespace ebu_list::analysis
