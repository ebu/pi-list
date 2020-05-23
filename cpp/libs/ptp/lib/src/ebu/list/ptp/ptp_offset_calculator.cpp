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

        if(ptp_ts.i() == 0)
        {
            // Two step. Record the sync packet TS
            last_sync_ts_ = message.packet_timestamp();

            is_two_step_ = true;
        }
        else
        {
            // One step. Do the math.
            update_average(message.packet_timestamp(), ptp_ts);
            is_two_step_ = false;
        }
    }

    void operator()(const ptp::v2::announce& message)
    {
        master_id_      = message.header().value().clock_identity();
        grandmaster_id_ = message.header().value().clock_identity();
    }

    void operator()(const ptp::v2::follow_up& message)
    {
        logger()->trace("v2::follow_up");
        const auto ptp_ts = message.message().precise_origin_timestamp();

        is_two_step_ = true;

        if(!last_sync_ts_)
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

    bool has_info_ = false;
    std::optional<clock::time_point> last_sync_ts_;
    int sample_count_  = 0;
    double average_ns_ = 0;
    std::optional<v2::clock_id_t> grandmaster_id_;
    std::optional<v2::clock_id_t> master_id_;
    std::optional<bool> is_two_step_;
};

ptp_offset_calculator::ptp_offset_calculator() : impl_(std::make_unique<impl>())
{
}

ptp_offset_calculator::~ptp_offset_calculator() = default;

void ptp_offset_calculator::on_data(ptp::some_message&& message)
{
    impl_->has_info_ = true;

    std::visit(*impl_, message);
}

void ptp_offset_calculator::on_complete()
{
}

void ptp_offset_calculator::on_error(std::exception_ptr)
{
}

std::optional<ptp_offset_calculator::info> ptp_offset_calculator::get_info() const
{
    if(!impl_->has_info_) return std::nullopt;

    info i{};
    i.average_offset = std::chrono::nanoseconds(static_cast<int64_t>(impl_->average_ns_));
    i.grandmaster_id = impl_->grandmaster_id_;
    i.master_id      = impl_->master_id_;
    i.is_two_step    = impl_->is_two_step_;

    return i;
}
