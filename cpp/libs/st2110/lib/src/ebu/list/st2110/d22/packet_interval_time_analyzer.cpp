#include "ebu/list/st2110/d22/packet_interval_time_analyzer.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::st2110::d22;

//------------------------------------------------------------------------------

struct packet_interval_time_analyzer::impl
{
    impl(listener_uptr l, media::video::Rate rate) : listener_(std::move(l)), tframe_(1 / rate) {}

    void on_data(const rtp::packet& p)
    {
        packet_interval_time_info info{};
        info.packets_count++;
        const auto packet_ts = p.info.udp.packet_time;

        if(!previous_timestamp_.has_value())
        {
            previous_timestamp_ = packet_ts;
        }
        const auto diff_packet_time = packet_ts - previous_timestamp_.value();
        const auto diff_packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(diff_packet_time).count();

        if(diff_packet_time_ns > info.max){
            info.max = diff_packet_time_ns;
        }

        if(diff_packet_time_ns < info.min){
            info.min = diff_packet_time_ns;
        }

        info.avg = (info.avg + diff_packet_time_ns)/ info.packets_count;

        listener_->on_data(info);
    }

    const listener_uptr listener_;
    const fraction64 tframe_; // Period of a frame, in seconds
    std::optional<clock::time_point> previous_timestamp_;
};

//------------------------------------------------------------------------------

packet_interval_time_analyzer::packet_interval_time_analyzer(listener_uptr l, media::video::Rate rate)
    : impl_(std::make_unique<impl>(std::move(l), rate))
{
}

packet_interval_time_analyzer::~packet_interval_time_analyzer() = default;

void packet_interval_time_analyzer::on_data(const rtp::packet& p)
{
    impl_->on_data(p);
}

void packet_interval_time_analyzer::on_complete()
{
    impl_->listener_->on_complete();
}

void packet_interval_time_analyzer::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
