#include "pch.h"
#include "ebu/list/handlers/audio_delay_analyser.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/core/math.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d30;

//------------------------------------------------------------------------------

struct audio_delay_analyser::impl
{
    impl(listener_uptr l)
        : listener_(std::move(l))
    {
    }

    const listener_uptr listener_;
};

audio_delay_analyser::audio_delay_analyser(rtp::packet first_packet, listener_uptr l, int sampling)
    : impl_(std::make_unique<impl>(std::move(l))),
    first_packet_ts_usec_(std::chrono::duration_cast<std::chrono::microseconds>(first_packet.info.udp.packet_time.time_since_epoch()).count()),
    sampling_(sampling)
{
    delays_.clear();
}

audio_delay_analyser::~audio_delay_analyser() = default;

void audio_delay_analyser::on_complete()
{
    impl_->listener_->on_complete();
}

void audio_delay_analyser::on_error(std::exception_ptr)
{
}

void audio_delay_analyser::on_data(const rtp::packet& packet)
{
    const auto packet_ts_usec = std::chrono::duration_cast<std::chrono::microseconds>(packet.info.udp.packet_time.time_since_epoch()).count();

    /* new measurement window for delays and TS-DF */
    // TODO: remove 200ms and compute windows duration so that it is 1s for a 1Mbits/s stream
    if((packet_ts_usec - first_packet_ts_usec_) > 200000)
    {
        first_packet_ts_usec_ = packet_ts_usec;

        /* get min, max, mean of delays */
        const auto minmax = std::minmax_element(delays_.begin(), delays_.end());
        const auto min = minmax.first[0];
        const auto max = minmax.second[0];
        const auto mean = std::accumulate(delays_.begin(), delays_.end(), 0.0) / delays_.size();

        /* TS-DF is the amplitude of relative transit delay based on a
         * reference delay, i.e. the first delay of the measurement window */
        const auto init = delays_[0];
        const auto tsdf = (max - init) - (min - init);

        logger()->trace("audio: new delay=[{},{},{}] TS-DF=[{},{}]={}",
                min, mean, max, (max - init), (min - init), tsdf);

        /* shoot to influxdb */
        impl_->listener_->on_data({packet.info.udp.packet_time, min, max, static_cast<int64_t>(mean), tsdf});

        /* reinit measurement the window with the new reference transit
         * delay for TS-DF, i.e. (R(0)-S(0)) */
        delays_.clear();
    }

    /* save every delay */
    delays_.push_back(get_transit_delay(packet));
}

/*
 * get_transit_delay() returns the (R(i) - S(i)) (usec) part of TS-DF
 */
int64_t audio_delay_analyser::get_transit_delay(const rtp::packet& packet)
{
    constexpr auto RTP_WRAP_AROUND = 0x100000000;
    const auto packet_ts_nsec = std::chrono::duration_cast<std::chrono::nanoseconds>(packet.info.udp.packet_time.time_since_epoch()).count();
    const auto packet_time = fraction64(packet_ts_nsec, std::giga::num);
    const auto ticks_wrap = static_cast<int64_t>(round(static_cast<double>(packet_time) * sampling_)) %  RTP_WRAP_AROUND;
    const auto tick_delay = ticks_wrap - packet.info.rtp.view().timestamp();
    const auto delta_nsec = tick_delay * 1'000'000'000 / sampling_;

    logger()->trace("audio tick_delay={} delta_nsec={}", tick_delay, delta_nsec);

    return delta_nsec / 1000; //return usec
}
