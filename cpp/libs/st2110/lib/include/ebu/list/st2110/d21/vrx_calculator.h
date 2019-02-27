#pragma once

#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/d21/frame_start_filter.h"
#include "ebu/list/core/media/video_description.h"

namespace ebu_list::st2110::d21
{
    struct packet_info
    {
        clock::time_point packet_time{};
        int vrx{};
        std::optional<double> delta_to_ideal_tpr0{};
    };

    class vrx_calculator
    {
    public:
        vrx_calculator(int npackets, media::video::info video_info, vrx_settings settings);

        packet_info on_packet(const clock::time_point& packet_timestamp, bool frame_start);

    private:
		void on_frame_start(const fraction64& packet_time);
		
		const vrx_settings settings_;
        const fraction64 tframe_; // Period of a frame, in seconds
        const vrx_constants constants_;
        int64_t current_n_ = 0;
        std::optional<fraction64> first_tvd_;
        int64_t frame_count_ = 0;
        fraction64 tvd_;
        std::optional<fraction64> start_draining_ts_;
        int drained_prev_ = 0;
        int vrx_prev_ = 0;
		double trs_ns_ = 0;
    };
}
