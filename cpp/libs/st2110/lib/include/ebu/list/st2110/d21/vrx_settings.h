#pragma once

#include "ebu/list/core/media/video_description.h"

namespace ebu_list::st2110::d21
{
    enum class read_schedule { gapped, linear };

    fraction64 get_ractive(read_schedule schedule, media::video::scan_type scan, media::video::video_dimensions raster);
    fraction64 get_tro_default_multiplier(media::video::scan_type scan, media::video::video_dimensions raster);
    fraction64 get_tro_default(fraction64 tframe, media::video::scan_type scan, media::video::video_dimensions raster);

    struct vrx_constants
    {
        fraction64 trs;
        fraction64 tr_offset;
    };

    vrx_constants calculate_vrx_constants(int64_t npackets,
        fraction64 tframe,
        read_schedule schedule,
        media::video::scan_type scan,
        media::video::video_dimensions raster);
}
