#pragma once

#include "ebu/list/core/math.h"
#include "ebu/list/core/media/video_description.h"

namespace ebu_list::st2110::d21
{
    enum class read_schedule { gapped, linear };

    std::string to_string(read_schedule schedule);
    read_schedule read_schedule_from_string(std::string_view s);

    enum class compliance_profile
    {
        narrow,
        narrow_linear,
        wide,
        not_compliant
    };

    struct compliance_parameters
    {
        int vrx_full;
        int cmax;
    };

    int calculate_vrx_full_narrow(int n_packets, fraction64 t_frame);
    int calculate_vrx_full_wide(int n_packets, fraction64 t_frame);
    int calculate_vrx_full(compliance_profile profile, int n_packets, fraction64 t_frame);

    int calculate_cmax_narrow(read_schedule schedule,
        int n_packets,
        fraction t_frame,
        media::video::scan_type scan,
        media::video::video_dimensions raster);

    int calculate_cmax_wide(int n_packets, fraction t_frame);

    int calculate_cmax(compliance_profile profile, 
        read_schedule schedule,
        int n_packets,
        fraction t_frame,
        media::video::scan_type scan,
        media::video::video_dimensions raster);

    compliance_parameters calculate_narrow_compliance_parameters(int n_packets,
        fraction t_frame,
        read_schedule schedule,
        media::video::scan_type scan,
        media::video::video_dimensions raster);

    compliance_parameters calculate_wide_compliance_parameters(int n_packets,
        fraction t_frame);

    compliance_parameters calculate_compliance_parameters(compliance_profile profile,
        int n_packets,
        fraction t_frame,
        read_schedule schedule,
        media::video::scan_type scan,
        media::video::video_dimensions raster);

    int64_t calculate_n(fraction64 packet_time, fraction64 tframe);

    enum tvd_kind
    {
        ideal,
        first_packet_first_frame
    };

    struct vrx_settings
    {
        read_schedule schedule;
        tvd_kind tvd;
        std::optional<std::chrono::nanoseconds> troffset;
    };

    fraction64 get_ractive(read_schedule schedule, media::video::scan_type scan, media::video::video_dimensions raster);
    fraction64 get_tro_default_multiplier(media::video::scan_type scan, media::video::video_dimensions raster);
    fraction64 get_tro_default(fraction64 tframe, media::video::scan_type scan, media::video::video_dimensions raster);

    struct vrx_constants
    {
        fraction64 trs;
        fraction64 tr_offset;
    };

    vrx_constants calculate_vrx_constants(int npackets,
        fraction64 tframe,
        read_schedule schedule,
        media::video::scan_type scan,
        media::video::video_dimensions raster);
}
