#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/vrx_analyzer.h"
#include "ebu/list/st2110/d21/calculators.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

struct vrx_analyzer::impl
{
    impl(listener_uptr listener, int64_t npackets, media::video::info video_info, vrx_settings settings)
        : listener_(std::move(listener)),
        settings_(settings),
        tframe_(1 / video_info.rate),
        constants_(calculate_vrx_constants(npackets, tframe_, settings_.schedule, video_info.scan, video_info.raster))
    {
    }

    void update(const frame_start_filter::packet_info& info)
    {
        const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(info.packet.info.udp.packet_time.time_since_epoch()).count();
        const auto packet_time = fraction64(packet_time_ns, std::giga::num);

        auto current = packet_info{ info.packet.info.udp.packet_time };

        if (info.frame_start)
        {
            current_n_ = calculate_n(packet_time, tframe_);

            const auto base_frame_time = current_n_ * tframe_;
            const auto ideal_tvd = base_frame_time + constants_.tr_offset;

            if (!first_tvd_)
            {
                first_tvd_ = packet_time;
            }

            if (settings_.tvd == tvd_kind::ideal)
            {
                tvd_ = ideal_tvd;
            }
            else if (settings_.tvd == tvd_kind::first_packet_first_frame)
            {
                tvd_ = first_tvd_.value() + tframe_ * frame_count_;
            }
            else
            {
                LIST_ASSERT(settings_.tvd == tvd_kind::first_packet_each_frame);
                tvd_ = packet_time;
            }

            drained_prev_ = 0;
            vrx_prev_ = 0;

            current.delta_to_ideal_tpr0 = ideal_tvd - packet_time;

            ++frame_count_;
        }

        // TODO: decide on this
        //# should not drain any more packet after time: Tvd + Npackets * Trs
        //# drained = int((cur_tm - initial_tm) / trs)
        //if (cur_tm - tvd) < (tvd + npackets * trs)

        const auto drained = static_cast<int>(floor((packet_time - tvd_ + constants_.trs) / constants_.trs));
        current.vrx = vrx_prev_ + 1 - (drained - drained_prev_);

        //if (vrx_curr < 0)
        //{
        //    // signal underflow but keep the buffer size at 0
        //    vrx_prev_ = 0;
        //}
        //else
        //{
        //    vrx_prev_ = vrx_curr;
        //}

        vrx_prev_ = current.vrx;

        drained_prev_ = drained;

        listener_->on_data(current);
    }

    const listener_uptr listener_;
    const vrx_settings settings_;
    const fraction64 tframe_; // Period of a frame, in seconds
    const vrx_constants constants_;
    int64_t current_n_ = 0;
    std::optional<fraction64> first_tvd_;
    int64_t frame_count_ = 0;
    fraction64 tvd_;
    int drained_prev_ = 0;
    int vrx_prev_ = 0;
};

//------------------------------------------------------------------------------

vrx_analyzer::vrx_analyzer(listener_uptr l, int64_t npackets, media::video::info video_info, vrx_settings _settings)
    : impl_(std::make_unique<impl>(std::move(l), npackets, video_info, _settings))
{
}

vrx_analyzer::~vrx_analyzer() = default;

void vrx_analyzer::on_data(const frame_start_filter::packet_info& info)
{
    impl_->update(info);
}

void vrx_analyzer::on_complete()
{
    impl_->listener_->on_complete();
}

void vrx_analyzer::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
