#include "pch.h"
#include "ebu/list/handlers/audio_timing_analyser.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/core/math.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d30;

//------------------------------------------------------------------------------

struct audio_timing_analyser::impl
{
    impl(listener_uptr l)
        : listener_(std::move(l))
    {
    }

    const listener_uptr listener_;
};

audio_timing_analyser::audio_timing_analyser(rtp::packet first_packet, listener_uptr l, int sampling)
    : impl_(std::make_unique<impl>(std::move(l))),
    first_packet_ts_usec_(std::chrono::duration_cast<std::chrono::microseconds>(first_packet.info.udp.packet_time.time_since_epoch()).count()),
    sampling_(sampling)
{
    delta_rtp_ts_vs_pkt_ts.clear();
}

audio_timing_analyser::~audio_timing_analyser() = default;

void audio_timing_analyser::on_complete()
{
    impl_->listener_->on_complete();
}

void audio_timing_analyser::on_error(std::exception_ptr)
{
}

void audio_timing_analyser::on_data(const rtp::packet& packet)
{
    const auto packet_ts_usec = std::chrono::duration_cast<std::chrono::microseconds>(packet.info.udp.packet_time.time_since_epoch()).count();

    /* new measurement window for delays and TS-DF */
    // TODO: remove 200ms and compute windows duration so that it is 1s for a 1Mbits/s stream
    if((packet_ts_usec - first_packet_ts_usec_) > 200000)
    {
        first_packet_ts_usec_ = packet_ts_usec;

        /* get min, max, mean of delays */
        const auto minmax = std::minmax_element(delta_rtp_ts_vs_pkt_ts.begin(), delta_rtp_ts_vs_pkt_ts.end());
        const auto min = minmax.first[0];
        const auto max = minmax.second[0];
        const auto mean = std::accumulate(delta_rtp_ts_vs_pkt_ts.begin(), delta_rtp_ts_vs_pkt_ts.end(), 0.0) / delta_rtp_ts_vs_pkt_ts.size();

        /* TS-DF is the amplitude of relative transit delay based on a
         * reference delay, i.e. the first delay of the measurement window */
        const auto init = delta_rtp_ts_vs_pkt_ts[0];
        const auto tsdf = (max - init) - (min - init);

        logger()->trace("audio: new delay=[{},{},{}] TS-DF=[{},{}]={}",
                min, mean, max, (max - init), (min - init), tsdf);

        /* shoot to influxdb */
        impl_->listener_->on_data({packet.info.udp.packet_time, min, max, static_cast<int64_t>(mean), tsdf});

        /* reinit measurement the window with the new reference transit
         * delay for TS-DF, i.e. (R(0)-S(0)) */
        delta_rtp_ts_vs_pkt_ts.clear();
    }

    /* save every delay */
    delta_rtp_ts_vs_pkt_ts.push_back(get_delta_rtp_ts_vs_pkt_ts(packet));
}

/*
 * get_delta_rtp_ts_vs_pkt_ts():
 * - is the raw information for RTP timestamp validation
 * - returns the (R(i) - S(i)) (usec) part of TS-DF
 * - is AKA transit time or RTP-to-PTP delay
 */
int64_t audio_timing_analyser::get_delta_rtp_ts_vs_pkt_ts(const rtp::packet& packet)
{
    constexpr auto RTP_WRAP_AROUND = 0x100000000;
    const auto packet_ts_nsec = std::chrono::duration_cast<std::chrono::nanoseconds>(packet.info.udp.packet_time.time_since_epoch()).count();
    const auto packet_time = fraction64(packet_ts_nsec, std::giga::num);
    const auto ticks_wrap = static_cast<int64_t>(round(static_cast<double>(packet_time) * sampling_)) %  RTP_WRAP_AROUND;
    const auto tick_delta = ticks_wrap - packet.info.rtp.view().timestamp();
    const auto nsec_delta = tick_delta * 1'000'000'000 / sampling_;

    logger()->trace("audio tick_delta={} nsec_delta={}", tick_delta, nsec_delta);

    return nsec_delta / 1000; //return usec
}
