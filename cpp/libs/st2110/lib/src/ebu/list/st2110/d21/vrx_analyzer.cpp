#include "ebu/list/st2110/d21/vrx_analyzer.h"
#include "ebu/list/core/math/histogram.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/pch.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

struct vrx_analyzer::impl
{
    impl(listener_uptr listener, histogram_listener_uptr hl, int npackets, media::video::info video_info,
         vrx_settings settings)
        : listener_(std::move(listener)), histogram_listener_(std::move(hl)),
          calculator_(npackets, video_info, settings)
    {
    }

    void update(const frame_start_filter::packet_info& info)
    {
        const auto current = calculator_.on_packet(info.packet.info.udp.packet_time, info.frame_start);
        listener_->on_data(current);
        histogram_.add_value(current.vrx);
    }

    const listener_uptr listener_;
    const histogram_listener_uptr histogram_listener_;
    histogram<int> histogram_;
    vrx_calculator calculator_;
};

//------------------------------------------------------------------------------

vrx_analyzer::vrx_analyzer(listener_uptr l, histogram_listener_uptr histogram_listener, int npackets,
                           media::video::info video_info, vrx_settings _settings)
    : impl_(std::make_unique<impl>(std::move(l),
                                   histogram_listener ? std::move(histogram_listener)
                                                      : std::make_unique<null_histogram_listener>(),
                                   npackets, video_info, _settings))
{
}

vrx_analyzer::~vrx_analyzer() = default;

void vrx_analyzer::on_data(const frame_start_filter::packet_info& info)
{
    impl_->update(info);
}

void vrx_analyzer::on_complete()
{
    impl_->histogram_listener_->on_data(impl_->histogram_.values());
    impl_->histogram_listener_->on_complete();
    impl_->listener_->on_complete();
}

void vrx_analyzer::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
