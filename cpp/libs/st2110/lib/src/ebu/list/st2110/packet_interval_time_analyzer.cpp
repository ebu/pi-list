#include "ebu/list/st2110/packet_interval_time_analyzer.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;
using namespace ebu_list::st2110;
using nlohmann::json;

//------------------------------------------------------------------------------

struct packet_interval_time_analyzer::impl
{
    impl(listener_uptr hl) : listener_(std::move(hl)) {}

    packet_interval_time_info info{};

    void on_data(const udp::datagram& p)
    {
        ++info.packets_count;
        const auto packet_ts = p.info.packet_time;

        if(previous_timestamp_.has_value())
        {
            const auto diff_packet_time = packet_ts - previous_timestamp_.value();
            const auto diff_packet_time_ns =
                std::chrono::duration_cast<std::chrono::nanoseconds>(diff_packet_time).count();

            info.data =
                info.data.value_or(min_max_avg_t{diff_packet_time_ns, diff_packet_time_ns, diff_packet_time_ns});

            info.data->min = std::min(info.data->min, diff_packet_time_ns);
            info.data->max = std::max(info.data->max, diff_packet_time_ns);
            info.data->avg = (info.data->avg * (info.packets_count - 1) + diff_packet_time_ns) / info.packets_count;

            histogram_.add_value(diff_packet_time_ns, bucket_width);
        }
        previous_timestamp_ = packet_ts;
    }

    const listener_uptr listener_;
    histogram_bucket<int> histogram_;
    std::optional<clock::time_point> previous_timestamp_;
    const int bucket_width = 10;
};

//------------------------------------------------------------------------------

packet_interval_time_analyzer::packet_interval_time_analyzer(listener_uptr listener_)
    : impl_(std::make_unique<impl>(std::move(listener_)))
{
}

packet_interval_time_analyzer::~packet_interval_time_analyzer() = default;

void packet_interval_time_analyzer::on_data(const udp::datagram& p)
{
    impl_->on_data(p);
}

void packet_interval_time_analyzer::on_complete()
{
    impl_->listener_->on_data(impl_->info);
    impl_->listener_->on_complete();
}

void packet_interval_time_analyzer::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
