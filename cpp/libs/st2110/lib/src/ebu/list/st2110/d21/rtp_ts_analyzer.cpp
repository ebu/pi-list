#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/rtp_ts_analyzer.h"
#include "ebu/list/st2110/d21/calculators.h"
#include "ebu/list/core/math.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------
namespace
{
    constexpr auto RTP_WRAP_AROUND = 0x100000000;
    constexpr auto RTP_CLOCK_RATE = 90000;

    uint32_t calculate_rtp_timestamp(fraction64 time)
    {
        // TODO: this overflows if using fraction
        const auto ticks = static_cast<int64_t>(floor(static_cast<double>(time) * RTP_CLOCK_RATE));
        return ticks % RTP_WRAP_AROUND;
    }
}
//------------------------------------------------------------------------------

struct rtp_ts_analyzer::impl
{
    impl(listener_uptr l, media::video::Rate rate)
        : listener_(std::move(l)),
        tframe_(1 / rate)
    {
    }

    void update_frame(const rtp::packet& packet, packet_info& info)
    {
        const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(packet.info.udp.packet_time.time_since_epoch()).count();
        const auto packet_time = fraction64(packet_time_ns, std::giga::num);
        const auto rtp_timestamp = packet.info.rtp.view().timestamp();

        if (previous_timestamp_)
        {
            const auto delta = modulo_difference(rtp_timestamp, previous_timestamp_.value());
            info.rtp_ts_delta = delta;
        }

        previous_timestamp_ = rtp_timestamp;

        const auto n = calculate_n(packet_time, tframe_);
        const auto base_frame_time = n * tframe_;

        const auto rtp_ts_for_packet_time = calculate_rtp_timestamp(packet_time);
        const auto rtp_ts_for_NTs = calculate_rtp_timestamp(base_frame_time);

        info.delta_rtp_vs_packet_time = static_cast<int>(rtp_timestamp) - static_cast<int>(rtp_ts_for_packet_time);
        info.delta_rtp_vs_NTs = static_cast<int>(rtp_timestamp) - static_cast<int>(rtp_ts_for_NTs);
    }

    void on_data(const frame_start_filter::packet_info& source_info)
    {
        if (source_info.frame_start)
        {
            packet_info info{ source_info.packet.info.udp.packet_time };

            update_frame(source_info.packet, info);

            listener_->on_data(info);
        }
    }

    const listener_uptr listener_;
    const fraction64 tframe_; // Period of a frame, in seconds
    std::optional<uint32_t> previous_timestamp_;
};

//------------------------------------------------------------------------------

rtp_ts_analyzer::rtp_ts_analyzer(listener_uptr l, media::video::Rate rate)
    : impl_(std::make_unique<impl>(std::move(l), rate))
{
}

rtp_ts_analyzer::~rtp_ts_analyzer() = default;

void rtp_ts_analyzer::on_data(const frame_start_filter::packet_info& info)
{
    impl_->on_data(info);
}

void rtp_ts_analyzer::on_complete()
{
    impl_->listener_->on_complete();
}

void rtp_ts_analyzer::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
