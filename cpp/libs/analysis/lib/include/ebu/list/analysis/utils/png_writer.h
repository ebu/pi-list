#pragma once

#include "ebu/list/core/media/video/dimensions.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/platform/file.h"

namespace ebu_list::analysis
{
    void write_png(oview data, media::video::video_dimensions dimensions, path target);
}
