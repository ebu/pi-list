#include "ebu/list/ptp/ptp_offset_calculator.h"
#include <utility>
using namespace ebu_list;
using namespace ebu_list::ptp;

//------------------------------------------------------------------------------

struct ptp_offset_calculator::impl
{
    void operator()(const ptp::v2::sync& message)
    {
        logger()->trace("v2::sync");
        const auto ptp_ts = message.message().origin_timestamp();

        if (ptp_ts.i() == 0)
        {
            // Two step. Record the sync packet TS
            last_sync_ts_ = message.packet_timestamp();
        }
        else
        {
            // One step. Do the math.
            update_average(message.packet_timestamp(), ptp_ts);
        }
    }

    void operator()(const ptp::v2::follow_up& message)
    {
        logger()->trace("v2::follow_up");
        const auto ptp_ts = message.message().precise_origin_timestamp();

        if (!last_sync_ts_)
        {
            // Haven't received a Sync message yet
            return;
        }

        update_average(last_sync_ts_.value(), ptp_ts);
    }

    void operator()(const ptp::v1::message&) {}
    void operator()(const ptp::v2::delay_req&) {}
    void operator()(const ptp::v2::delay_resp&) {}
    void operator()(const ptp::v2::other&) {}

    void update_average(clock::time_point packet_ts, ts80 origin_ts)
    {
        const auto origin = ptp::to_time_point(origin_ts);

        const auto packet_ts_to_origin = packet_ts - origin;
        const auto x                   = std::chrono::duration_cast<std::chrono::nanoseconds>(packet_ts_to_origin);

        average_ns_ = (sample_count_ * average_ns_ + x.count()) / (sample_count_ + 1);
        ++sample_count_;
    }

    std::optional<clock::time_point> last_sync_ts_;
    int sample_count_  = 0;
    double average_ns_ = 0;
};

ptp_offset_calculator::ptp_offset_calculator() : impl_(std::make_unique<impl>())
{
}

ptp_offset_calculator::~ptp_offset_calculator() = default;

void ptp_offset_calculator::on_data(ptp::some_message&& message)
{
    std::visit(*impl_, message);
}

void ptp_offset_calculator::on_complete()
{
}

void ptp_offset_calculator::on_error(std::exception_ptr)
{
}

clock::duration ptp_offset_calculator::get_average() const
{
    return std::chrono::nanoseconds(static_cast<int64_t>(impl_->average_ns_));
}
