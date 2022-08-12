#include "ebu/list/st2110/d21/compliance.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

compliance_analyzer::compliance_analyzer(int npackets, media::video::Rate rate, media::video::info video_info,
                                         vrx_settings settings, media::video::scan_type scan,
                                         media::video::video_dimensions raster,
                                         vrx_analysis_mode_t vrx_analysis_mode) noexcept
    : c_calculator_(npackets, rate), vrx_calculator_(npackets, video_info, settings),
      checker_(npackets, 1 / rate, settings.schedule, scan, raster), vrx_analysis_mode_(vrx_analysis_mode)
{
}

void compliance_analyzer::handle_packet(const rtp::packet_info& info) noexcept
{
    const auto cinst = c_calculator_.on_packet(info.udp.packet_time);
    cinst_histogram_.add_value(cinst);

    if(vrx_analysis_mode_ == vrx_analysis_mode_t::disabled) return;

    if(state_ != state::waiting_for_frame)
    {
        const auto vrx_info = vrx_calculator_.on_packet(info.udp.packet_time, state_ == state::is_frame_start);

        vrx_histogram_.add_value(vrx_info.vrx);
    }

    if(state_ == state::is_frame_start)
    {
        state_ = state::in_frame;
    }

    if(info.rtp.view().marker())
    {
        state_ = state::is_frame_start;
    }
}

compliance_parameters compliance_analyzer::get_narrow_parameters() const
{
    return checker_.get_narrow_parameters();
}

compliance_parameters compliance_analyzer::get_wide_parameters() const
{
    return checker_.get_wide_parameters();
}

double compliance_analyzer::get_trs() const
{
    return vrx_calculator_.get_trs();
}

compliance_analyzer::compliance_status compliance_analyzer::get_compliance() const noexcept
{
    const auto current_vrx_min  = get_histogram_min(vrx_histogram_.values());
    const auto current_vrx_peak = get_histogram_peak(vrx_histogram_.values());
    const auto current_c_peak   = get_histogram_peak(cinst_histogram_.values());

    return {checker_.check(vrx_analysis_mode_, current_vrx_min, current_vrx_peak, current_c_peak), checker_.check_c_peak(current_c_peak),
            checker_.check_vrx_min_peak(current_vrx_min, current_vrx_peak), vrx_analysis_mode_};
}

void compliance_analyzer::clear_histograms() noexcept
{
    cinst_histogram_.clear();
    vrx_histogram_.clear();
}

const std::map<int, int>& compliance_analyzer::get_cinst_histogram() const noexcept
{
    return cinst_histogram_.values();
}

const std::map<int, int>& compliance_analyzer::get_vrx_histogram() const noexcept
{
    return vrx_histogram_.values();
}

//------------------------------------------------------------------------------

compliance_checker::compliance_checker(int n_packets, fraction t_frame, read_schedule schedule,
                                       media::video::scan_type scan, media::video::video_dimensions raster) noexcept
    : narrow_(calculate_narrow_compliance_parameters(n_packets, t_frame, schedule, scan, raster)),
      wide_(calculate_wide_compliance_parameters(n_packets, t_frame)),
      narrow_kind_((schedule == read_schedule::gapped) ? compliance_profile::narrow : compliance_profile::narrow_linear)
{
}

compliance_profile compliance_checker::check_vrx_min_peak(int vrx_min, int vrx_peak) const noexcept
{
    if(vrx_min < 0)
    {
        return compliance_profile::not_compliant;
    }

    if(vrx_peak <= narrow_.vrx_full)
    {
        return narrow_kind_;
    }

    if(vrx_peak <= wide_.vrx_full)
    {
        return compliance_profile::wide;
    }

    return compliance_profile::not_compliant;
}

compliance_profile compliance_checker::check_c_peak(int c_peak) const noexcept
{
    if(c_peak <= narrow_.cmax)
    {
        return narrow_kind_;
    }

    if(c_peak <= wide_.cmax)
    {
        return compliance_profile::wide;
    }

    return compliance_profile::not_compliant;
}

compliance_profile compliance_checker::check(vrx_analysis_mode_t mode, int vrx_min, int vrx_peak, int c_peak) const noexcept
{
    const auto c   = check_c_peak(c_peak);
    if(mode == vrx_analysis_mode_t::disabled) return c;

    const auto vrx = check_vrx_min_peak(vrx_min, vrx_peak);

    if(vrx == narrow_kind_) return c;

    if(vrx == compliance_profile::wide)
    {
        if(c == narrow_kind_) return compliance_profile::wide;
        return c;
    }

    return compliance_profile::not_compliant;
}

compliance_parameters compliance_checker::get_narrow_parameters() const
{
    return narrow_;
}

compliance_parameters compliance_checker::get_wide_parameters() const
{
    return wide_;
}
