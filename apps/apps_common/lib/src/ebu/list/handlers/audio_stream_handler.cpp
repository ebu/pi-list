#include "ebu/list/handlers/audio_stream_handler.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/math.h"
#include "pch.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d30;

//------------------------------------------------------------------------------
namespace
{
    int channel_size_in_bytes(const audio_description& desc)
    {
        return number_of_bits(desc.encoding) / 8;
    }

    int sample_size(const audio_description& desc)
    {
        return desc.number_channels * channel_size_in_bytes(desc);
    }
}

//------------------------------------------------------------------------------

audio_stream_handler::audio_stream_handler(rtp::packet first_packet, serializable_stream_info info,
    audio_stream_details details, completion_handler ch)
    : info_(std::move(info)),
    audio_description_(std::move(details)),
    completion_handler_(std::move(ch))
{
    logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source), to_string(info_.network.destination));

    info.state = StreamState::ON_GOING_ANALYSIS;

    audio_description_.first_packet_ts = first_packet.info.udp.packet_time;
    using float_sec = std::chrono::duration<float, std::ratio<1, 1>>;
    audio_description_.samples_per_packet = static_cast<int>(to_int(audio_description_.audio.sampling) * float_sec(audio_description_.audio.packet_time).count());
    audio_description_.sample_size = sample_size(audio_description_.audio) * audio_description_.samples_per_packet;
}

void audio_stream_handler::new_sample()
{
    current_sample_ = std::make_unique<sample>();

    for( auto i = 0; i < audio_description_.audio.number_channels; i++ )
    {
        current_sample_->buffer.push_back(block_factory_.get_buffer(channel_size_in_bytes(audio_description_.audio)));
    }
}

const audio_stream_details& audio_stream_handler::info() const
{
    return audio_description_;
}

const serializable_stream_info& audio_stream_handler::network_info() const
{
    return info_;
}

void audio_stream_handler::on_data(const rtp::packet& packet)
{
    audio_description_.last_packet_ts = packet.info.udp.packet_time;

    parse_packet(packet); // todo: allow moving out of a packet
    ++audio_description_.packet_count;
}

void audio_stream_handler::on_complete()
{
    this->on_stream_complete();
    info_.state = StreamState::ANALYZED;
    completion_handler_(*this);
}

void audio_stream_handler::on_error(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch (std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}

void audio_stream_handler::parse_packet(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    // check if number of samples is consistent
    if( const auto actual_size = sdu.view().size(); actual_size != audio_description_.sample_size )
    {
        logger()->error("bad packet size. Expected: {}; Actual: {}", audio_description_.sample_size, actual_size);
        return;
    }

    const auto ts = packet.info.rtp.view().timestamp();
    // todo: calculate ts per sample

    auto p = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();
    const auto size_of_channel = number_of_bits(audio_description_.audio.encoding) / 8;

    while (p < end)
    {
        if (!current_sample_) new_sample();
        logger()->trace("new frame. ts = {}", ts);

        for(auto i = 0; i < audio_description_.audio.number_channels; i++)
        {
            auto buffer = current_sample_->buffer[i];
            auto target_buffer_p = buffer->begin();

            if (target_buffer_p + size_of_channel > buffer->end())
            {
                logger()->error("buffer out of bounds");
                break;
            }

            cbyte_span source_data(p, size_of_channel);
            byte_span target_data(target_buffer_p, target_buffer_p + size_of_channel);
            ebu_list::copy(source_data, target_data);
            p += size_of_channel;
        }

        this->on_sample(std::move(current_sample_));
        audio_description_.sample_count++;
    }
}

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
