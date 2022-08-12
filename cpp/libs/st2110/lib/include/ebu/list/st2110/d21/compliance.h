#pragma once

#include "ebu/list/core/math.h"
#include "ebu/list/core/math/histogram.h"
#include "ebu/list/core/media/video_description.h"
#include "ebu/list/st2110/d21/c_calculator.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/d21/vrx_calculator.h"

namespace ebu_list::st2110::d21
{
    enum vrx_analysis_mode_t
    {
        enabled,
        disabled
    };

    class compliance_checker
    {
      public:
        compliance_checker(int n_packets, fraction t_frame, read_schedule schedule, media::video::scan_type scan,
                           media::video::video_dimensions raster) noexcept;

        compliance_profile check_vrx_min_peak(int vrx_min, int vrx_peak) const noexcept;
        compliance_profile check_c_peak(int c_peak) const noexcept;
        compliance_profile check(vrx_analysis_mode_t mode, int vrx_min, int vrx_peak, int c_peak) const noexcept;

        compliance_parameters get_narrow_parameters() const;
        compliance_parameters get_wide_parameters() const;

      private:
        const compliance_parameters narrow_;
        const compliance_parameters wide_;
        const compliance_profile narrow_kind_;
    };

    class compliance_analyzer
    {
      public:
        using int_histogram = histogram<int>;

        compliance_analyzer(int npackets, media::video::Rate rate, media::video::info video_info, vrx_settings settings,
                            media::video::scan_type scan, media::video::video_dimensions raster,
                            vrx_analysis_mode_t vrx_analysis_mode) noexcept;

        void handle_packet(const rtp::packet_info& info) noexcept;

        void clear_histograms() noexcept;

        const std::map<int, int>& get_cinst_histogram() const noexcept;
        const std::map<int, int>& get_vrx_histogram() const noexcept;

        struct compliance_status
        {
            compliance_profile global;
            compliance_profile cinst;
            compliance_profile vrx;
            vrx_analysis_mode_t mode;
        };

        [[nodiscard]] compliance_status get_compliance() const noexcept;
        [[nodiscard]] compliance_parameters get_narrow_parameters() const;
        [[nodiscard]] compliance_parameters get_wide_parameters() const;
        [[nodiscard]] double get_trs() const;

      private:
        st2110::d21::c_calculator c_calculator_;
        st2110::d21::vrx_calculator vrx_calculator_;
        const st2110::d21::compliance_checker checker_;
        int_histogram cinst_histogram_;
        int_histogram vrx_histogram_;

        enum class state
        {
            waiting_for_frame,
            is_frame_start,
            in_frame
        };

        state state_ = state::waiting_for_frame;
        const vrx_analysis_mode_t vrx_analysis_mode_;
    };
} // namespace ebu_list::st2110::d21
