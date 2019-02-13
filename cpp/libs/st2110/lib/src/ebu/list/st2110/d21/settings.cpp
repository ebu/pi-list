#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

namespace
{
    constexpr auto MAXIP = 1500; // TODO: allow signalling of MAXIP
}

//------------------------------------------------------------------------------

int d21::calculate_vrx_full_narrow(int n_packets, fraction64 t_frame)
{
    const auto vrx_full_1 = (1500 * 8) / MAXIP;
    const auto vrx_full_2 = int(floor(n_packets / (27000 * t_frame)));
    return std::max(vrx_full_1, vrx_full_2);
}

int d21::calculate_vrx_full_wide(int n_packets, fraction64 t_frame)
{
    const auto vrx_full_1 = (1500 * 720) / MAXIP;
    const auto vrx_full_2 = int(floor(n_packets / (300 * t_frame)));
    return std::max(vrx_full_1, vrx_full_2);
}

int d21::calculate_vrx_full(compliance_profile profile, int n_packets, fraction64 t_frame)
{
    if (profile == compliance_profile::narrow || profile == compliance_profile::narrow_linear)
    {
        return calculate_vrx_full_narrow(n_packets, t_frame);
    }

    LIST_ENFORCE(profile == compliance_profile::wide, std::runtime_error, "Invalid compliance profile");
    return calculate_vrx_full_wide(n_packets, t_frame);
}

int d21::calculate_cmax_narrow(read_schedule schedule,
    int n_packets,
    fraction t_frame,
    media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    const auto r_active = get_ractive(schedule, scan, raster);
    return std::max(4, static_cast<int>(n_packets / (43200 * r_active * t_frame)));
}

int d21::calculate_cmax_wide(int n_packets,
    fraction t_frame)
{
    return std::max(16, int(n_packets / (21600 * t_frame)));
}

int calculate_cmax(compliance_profile profile,
    read_schedule schedule,
    int n_packets,
    fraction t_frame,
    media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    if (profile == compliance_profile::narrow || profile == compliance_profile::narrow_linear)
    {
        return calculate_cmax_narrow(schedule,
            n_packets,
            t_frame,
            scan,
            raster);
    }

    LIST_ENFORCE(profile == compliance_profile::wide, std::runtime_error, "Invalid compliance profile");
    return calculate_cmax_wide(n_packets, t_frame);
}

compliance_parameters d21::calculate_compliance_parameters(compliance_profile profile,
    int n_packets,
    fraction t_frame,
    read_schedule schedule,
    media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    if (profile == compliance_profile::narrow || profile == compliance_profile::narrow_linear)
    {
        return calculate_narrow_compliance_parameters(n_packets,
            t_frame,
            schedule,
            scan,
            raster);
    }
    
    LIST_ENFORCE(profile == compliance_profile::wide, std::runtime_error, "Invalid compliance profile");
    return calculate_wide_compliance_parameters(n_packets,
        t_frame);
}

compliance_parameters d21::calculate_narrow_compliance_parameters(int n_packets,
    fraction t_frame,
    read_schedule schedule,
    media::video::scan_type scan,
    media::video::video_dimensions raster)
{
    const auto vrx_full = calculate_vrx_full_narrow(n_packets, t_frame);

    const auto c_max = calculate_cmax_narrow(schedule,
        n_packets,
        t_frame,
        scan,
        raster);

    return { vrx_full, c_max };
}

compliance_parameters d21::calculate_wide_compliance_parameters(int n_packets,
    fraction t_frame)
{
    const auto vrx_full = calculate_vrx_full_wide(n_packets, t_frame);
    const auto c_max = calculate_cmax_wide(n_packets, t_frame);

    return { vrx_full, c_max };
}

int64_t st2110::d21::calculate_n(fraction64 packet_time, fraction64 tframe)
{
    // TODO: without casting to double, this would overflow int64 calculations
    const auto n0 = static_cast<double>(packet_time) / static_cast<double>(tframe);
    return static_cast<int64_t>(std::floor(n0));
}

std::string d21::to_string(read_schedule schedule)
{
    switch (schedule)
    {
    case read_schedule::gapped: return "gapped";
    default:
        assert(schedule == read_schedule::linear);
        return "linear";
    }
}

read_schedule d21::read_schedule_from_string(std::string_view s)
{
    if (s == "gapped") return read_schedule::gapped;
    else if (s == "linear") return read_schedule::linear;
    else throw std::runtime_error("Invalid read schedule");
}

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
        // ST2110-21, 6.3.2 Gapped PRS Progressive Images
        return { 1080, 1125 };
    }
    else
    {
        LIST_ASSERT(scan == media::video::scan_type::INTERLACED);

        // ST2110-21, 6.3.3 Gapped PRS Interlaced and PsF Images
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
    // ST2110-21, 6.3.2 Gapped PRS Progressive Images
    // ST2110-21, 6.3.3 Gapped PRS Interlaced and PsF Images
    // ST2110-21, 6.4 Linear Packet Read Schedule

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
    // tframe is the period of a field, if interlaced. TODO: make this consistent with the name
    const auto interlaced_multiplier = scan == media::video::scan_type::INTERLACED ? 2 : 1;

    return get_tro_default_multiplier(scan, raster) * tframe * interlaced_multiplier;
}

vrx_constants st2110::d21::calculate_vrx_constants(int npackets,
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
