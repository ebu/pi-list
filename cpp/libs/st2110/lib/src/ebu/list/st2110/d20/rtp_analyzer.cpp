/*
 * Copyright (C) 2020 European Broadcasting Union - Technology & Innovation
 * Copyright (C) 2020 CBC / Radio-Canada
 */

#include "ebu/list/st2110/d20/rtp_analyzer.h"
#include "ebu/list/analysis/utils/rtp_utils.h"
#include "ebu/list/core/math.h"
#include "ebu/list/core/math/histogram.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

struct rtp_analyzer::impl
{
    impl(listener_uptr l, histogram_listener_uptr l_h) : listener_(std::move(l)), histogram_listener_(std::move(l_h)) {}

    void on_data(const frame_start_filter::packet_info& source_info)
    {
        if(source_info.frame_start)
        {
            packet_info info{source_info.packet.info.udp.packet_time, source_info.packet_index};
            listener_->on_data(info);
            histogram_.add_value(source_info.packet_index);
        }
    }

    void on_complete()
    {
        listener_->on_complete();
        histogram_listener_->on_data(histogram_.values());
        histogram_listener_->on_complete();
    }

    const listener_uptr listener_;
    const histogram_listener_uptr histogram_listener_;
    histogram<int> histogram_;
};

//------------------------------------------------------------------------------

rtp_analyzer::rtp_analyzer(listener_uptr l, histogram_listener_uptr l_h)
    : impl_(std::make_unique<impl>(std::move(l), std::move(l_h)))
{
}

rtp_analyzer::~rtp_analyzer() = default;

void rtp_analyzer::on_data(const frame_start_filter::packet_info& info)
{
    impl_->on_data(info);
}

void rtp_analyzer::on_complete()
{
    impl_->on_complete();
}

void rtp_analyzer::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
