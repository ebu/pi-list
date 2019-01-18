#include "ebu/list/handlers/audio_stream_handler.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/core/idioms.h"

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

struct audio_jitter_analyser::impl
{
    impl(listener_uptr l)
        : listener_(std::move(l))
    {
    }

    const listener_uptr listener_;
};

audio_jitter_analyser::audio_jitter_analyser(rtp::packet first_packet, listener_uptr l, int sampling)
    : impl_(std::make_unique<impl>(std::move(l))),
    first_packet_ts_usec_(std::chrono::duration_cast<std::chrono::microseconds>(first_packet.info.udp.packet_time.time_since_epoch()).count()),
    sampling_(sampling),
    first_delta_usec_(get_transit_time(first_packet)),
    relative_transit_time_max_(0),
    relative_transit_time_min_(0)
{
}

audio_jitter_analyser::~audio_jitter_analyser() = default;

void audio_jitter_analyser::on_complete()
{
    impl_->listener_->on_complete();
}

void audio_jitter_analyser::on_error(std::exception_ptr)
{
}

void audio_jitter_analyser::on_data(const rtp::packet& packet)
{
    const auto packet_ts_usec = std::chrono::duration_cast<std::chrono::microseconds>(packet.info.udp.packet_time.time_since_epoch()).count();

    /* new TS-DF measurement window */
    // TODO: remove 200ms and compute windows duration so that it is 1s for a 1Mbits/s stream
    if((packet_ts_usec - first_packet_ts_usec_) > 200000)
    {
        logger()->debug("audio jitter new reference packet, TS-DF = [{},{}] = {}",
                relative_transit_time_min_, relative_transit_time_max_,
                relative_transit_time_max_ - relative_transit_time_min_);

        /* shoot to influxdb TS-DF = Dmax - Dmin */
        impl_->listener_->on_data({ packet.info.udp.packet_time , relative_transit_time_max_ - relative_transit_time_min_ });

        first_delta_usec_ = get_transit_time(packet); /* this is (R(0)-S(0)) */
        first_packet_ts_usec_ = packet_ts_usec;
        relative_transit_time_max_ = relative_transit_time_min_ = 0;
        return;
    }

    /* TS-DF: compute relative transit time and update extrema */
    const auto relative_time_transit = get_transit_time(packet) - first_delta_usec_;
    if(relative_time_transit > relative_transit_time_max_)
    {
        relative_transit_time_max_ = relative_time_transit;
    }
    if(relative_time_transit < relative_transit_time_min_)
    {
        relative_transit_time_min_ = relative_time_transit;
    }
}

/*
 * Audio packet jitter measurement
 * https://tech.ebu.ch/docs/tech/tech3337.pdf
 *
 * get_transit_time() returns (R(i) - S(i)) in usec
 */
int64_t audio_jitter_analyser::get_transit_time(const rtp::packet& packet)
{
    const auto packet_ts_usec = std::chrono::duration_cast<std::chrono::microseconds>(packet.info.udp.packet_time.time_since_epoch()).count();
    const long rtp_ts_usec = static_cast<long>(packet.info.rtp.view().timestamp()) * static_cast<long>(1'000'000) / static_cast<long>(sampling_);
    const auto delta_usec = packet_ts_usec - rtp_ts_usec;

//     logger()->debug("audio jitter packet_ts_usec={} rtp_ts_usec={} delta_usec={} ",
//             std::chrono::duration_cast<std::chrono::microseconds>(packet.info.udp.packet_time.time_since_epoch()).count(),
//             rtp_ts_usec,
//             delta_usec);

    return delta_usec;
}
