#include "ebu/list/st2110/d22/packet_interval_time_analyzer.h"
#include "ebu/list/core/math/histogram.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::st2110::d22;

//------------------------------------------------------------------------------

struct packet_interval_time_analyzer::impl
{
    impl(histogram_listener_uptr hl, media::video::Rate rate) : histogram_listener_(std::move(hl)), tframe_(1 / rate) {}

    void on_data(const rtp::packet& p)
    {
        packet_interval_time_info info{};
        info.packets_count++;
        const auto packet_ts = p.info.udp.packet_time;

        if(!previous_timestamp_.has_value())
        {
            previous_timestamp_ = packet_ts;
        }
        const auto diff_packet_time    = packet_ts - previous_timestamp_.value();
        const auto diff_packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(diff_packet_time).count();

        if(diff_packet_time_ns > info.max)
        {
            info.max = diff_packet_time_ns;
        }

        if(diff_packet_time_ns < info.min)
        {
            info.min = diff_packet_time_ns;
        }

        info.avg = (info.avg + diff_packet_time_ns) / info.packets_count;

        //What to do with min, max, avg?
        //How to do the buckets
        histogram_.add_value(diff_packet_time_ns);
    }

    const histogram_listener_uptr histogram_listener_;
    const fraction64 tframe_; // Period of a frame, in seconds
    std::optional<clock::time_point> previous_timestamp_;
    histogram<int> histogram_;
};

//------------------------------------------------------------------------------

packet_interval_time_analyzer::packet_interval_time_analyzer(histogram_listener_uptr histogram_listener,
                                                             media::video::Rate rate)
    : impl_(std::make_unique<impl>(
          histogram_listener ? std::move(histogram_listener) : std::make_unique<null_histogram_listener>(), rate))
{
}

packet_interval_time_analyzer::~packet_interval_time_analyzer() = default;

void packet_interval_time_analyzer::on_data(const rtp::packet& p)
{
    impl_->on_data(p);
}

void packet_interval_time_analyzer::on_complete()
{
    impl_->histogram_listener_->on_data(impl_->histogram_.values());
    impl_->histogram_listener_->on_complete();
}

void packet_interval_time_analyzer::on_error(std::exception_ptr e)
{
    impl_->histogram_listener_->on_error(e);
}
