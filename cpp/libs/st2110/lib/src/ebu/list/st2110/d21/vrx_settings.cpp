#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/vrx_settings.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

fraction64 st2110::d21::get_ractive(read_schedule schedule, 
    media::video::scan_type scan, 
    media::video::video_dimensions raster)
{
    if (schedule == read_schedule::linear)
    {
        return { 1, 1 };
    }

    LIST_ASSERT(schedule == read_schedule::gapped);

    if (scan == media::video::scan_type::PROGRESSIVE)
    {
        // ST2110-21, � 6.3.2 Gapped PRS � Progressive Images
        return { 1080, 1125 };
    }
    else
    {
        LIST_ASSERT(scan == media::video::scan_type::INTERLACED);

        // ST2110-21, � 6.3.3 Gapped PRS � Interlaced and PsF Images
        if (raster.height < 576)
        {
            return { 487, 525 };
        }
        else if (raster.height < 1080)
        {
            return { 576, 625 };
        }
        else
        {
            LIST_ENFORCE(raster.height == 1080, std::runtime_error, "Raster not supported: {}", to_string(raster));
            return { 1080, 1125 };
        }
    }
}

fraction64 st2110::d21::get_tro_default_multiplier(media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    // ST2110-21, � 6.3.2 Gapped PRS � Progressive Images
    // ST2110-21, � 6.3.3 Gapped PRS � Interlaced and PsF Images
    // ST2110-21, � 6.4 Linear Packet Read Schedule

    if (scan == media::video::scan_type::PROGRESSIVE)
    {
        if (raster.height < 1080)
        {
            return { 28, 750 };
        }
        else
        {
            return { 43, 1125 };
        }
    }
    else
    {
        LIST_ASSERT(scan == media::video::scan_type::INTERLACED);

        if (raster.height < 576)
        {
            return { 20, 525 };
        }
        else if (raster.height < 1080)
        {
            return { 26, 625 };
        }
        else
        {
            LIST_ENFORCE(raster.height == 1080, std::runtime_error, "Raster not supported: {}", to_string(raster));
            return { 22, 1125 };
        }
    }
}

fraction64 st2110::d21::get_tro_default(fraction64 tframe,
    media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    return get_tro_default_multiplier(scan, raster) * tframe;
}

vrx_constants st2110::d21::calculate_vrx_constants(int64_t npackets,
    fraction64 tframe,
    read_schedule schedule,
    media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    const auto trs = tframe * get_ractive(schedule, scan, raster) / npackets;
    // TODO: support signalling in the SDP
    const auto tro_default = get_tro_default(tframe, scan, raster);

    return { trs, tro_default };
}
