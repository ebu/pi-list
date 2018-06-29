#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/vrx_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

vrx_calculator::vrx_calculator(int npackets,
    media::video::info video_info, 
    vrx_settings settings)
    : tvd_kind_(settings.tvd),
    tframe_(1 / video_info.rate),
    constants_(calculate_vrx_constants(npackets, tframe_, settings.schedule, video_info.scan, video_info.raster)),
    start_draining_watermark_(calculate_vrx_full(compliance_profile::narrow, npackets, tframe_) * 3 / 4) // TODO: make the percentage configurable
{
}

packet_info vrx_calculator::on_packet(const clock::time_point& packet_timestamp, bool frame_start)
{
    const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(packet_timestamp.time_since_epoch()).count();
    const auto packet_time = fraction64(packet_time_ns, std::giga::num);

    auto current = packet_info{ packet_timestamp };

    if (frame_start)
    {
        current_n_ = calculate_n(packet_time, tframe_);

        const auto base_frame_time = current_n_ * tframe_;
        const auto ideal_tvd = base_frame_time + constants_.tr_offset;

        if (!first_tvd_)
        {
            first_tvd_ = packet_time;
        }

        if (tvd_kind_ == tvd_kind::ideal)
        {
            tvd_ = ideal_tvd;
        }
        else if (tvd_kind_ == tvd_kind::first_packet_first_frame)
        {
            tvd_ = first_tvd_.value() + tframe_ * frame_count_;
        }
        else
        {
            LIST_ASSERT(tvd_kind_ == tvd_kind::first_packet_each_frame);
            tvd_ = packet_time;
        }

        drained_prev_ = 0;
        packet_number_in_frame_ = 0;

        // start with the buffer at 50%
        vrx_prev_ = 0;

        current.delta_to_ideal_tpr0 = ideal_tvd - packet_time;

        ++frame_count_;
    }

    // TODO: should we continue to drain packets after Tvd + Npackets * Trs?
    // TODO: should we disallow Vrx underflow?

    if (tvd_kind_ == tvd_kind::first_packet_each_frame)
    {
        ++packet_number_in_frame_;

        if (packet_number_in_frame_ < start_draining_watermark_)
        {
            current.vrx = packet_number_in_frame_;
            vrx_prev_ = current.vrx;
            drained_prev_ = 0;
            return current;
        }

        if (packet_number_in_frame_ == start_draining_watermark_)
        {
            start_draining_ts_ = packet_time;
        }

        const auto drained = static_cast<int>(floor((packet_time - start_draining_ts_ + constants_.trs) / constants_.trs));
        current.vrx = vrx_prev_ + 1 - (drained - drained_prev_);

        vrx_prev_ = current.vrx;

        drained_prev_ = drained;
    }
    else
    {
        const auto drained = static_cast<int>(floor((packet_time - tvd_ + constants_.trs) / constants_.trs));
        current.vrx = vrx_prev_ + 1 - (drained - drained_prev_);

        vrx_prev_ = current.vrx;

        drained_prev_ = drained;
    }

    return current;
}
