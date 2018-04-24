#include "ebu/list/handlers/audio_stream_handler.h"
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