#include "ebu/list/st2110/d20/rtp_ts_analyzer.h"
#include "ebu/list/core/math.h"
#include "ebu/list/analysis/utils/rtp_utils.h"
#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/st2110/pch.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

struct rtp_ts_analyzer::impl
{
    impl(listener_uptr l, media::video::Rate rate) : listener_(std::move(l)), tframe_(1 / rate) {}

    void update_frame(const rtp::packet& packet, packet_info& info)
    {
        const auto packet_time_ns =
            std::chrono::duration_cast<std::chrono::nanoseconds>(packet.info.udp.packet_time.time_since_epoch())
                .count();
        const auto packet_time   = fraction64(packet_time_ns, std::giga::num);
        const auto rtp_timestamp = packet.info.rtp.view().timestamp();

        if (previous_timestamp_)
        {
            const auto delta  = modulo_difference(rtp_timestamp, previous_timestamp_.value());
            info.rtp_ts_delta = rtp::to_ticks32(delta);
        }

        previous_timestamp_ = rtp_timestamp;

        const auto rtp_to_packet_deltas = calculate_rtp_to_packet_deltas(tframe_, rtp_timestamp, packet_time);

        info.delta_rtp_vs_packet_time      = rtp_to_packet_deltas.delta_rtp_vs_packet_time;
        info.delta_rtp_vs_NTs              = rtp_to_packet_deltas.delta_rtp_vs_NTs;
        info.delta_packet_time_vs_rtp_time = rtp_to_packet_deltas.delta_packet_time_vs_rtp_time;
    }

    void on_data(const frame_start_filter::packet_info& source_info)
    {
        if (source_info.frame_start)
        {
            packet_info info{source_info.packet.info.udp.packet_time};

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
