#include "pch.h"
#include "ebu/list/handlers/audio_stream_handler.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/math.h"

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
    ++audio_description_.packet_count;
    const auto previous_sequence_number = last_sequence_number_;
    audio_description_.last_packet_ts = packet.info.udp.packet_time;

    parse_packet(packet);
    if(previous_sequence_number)
    {
        const auto current_sequence_number = last_sequence_number_;
        const auto sn_difference = *current_sequence_number - *previous_sequence_number;

        // TODO: deal with wrap-around?
        if(sn_difference > 1)
        {
            audio_description_.dropped_packet_count += sn_difference - 1;
            logger()->info("audio rtp packet drop: {}", audio_description_.dropped_packet_count);
        }
    }
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
        logger()->trace("bad packet size. Expected: {}; Actual: {}", audio_description_.sample_size, actual_size);
        return;
    }

    auto p = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();
    last_sequence_number_ =  packet.info.rtp.view().sequence_number(); // no extended sequence number for audio

    this->on_sample_data(cbyte_span(p, end));

    const auto size_of_channel = number_of_bits(audio_description_.audio.encoding) / 8;
    const auto number_of_samples = (end - p) / (size_of_channel * audio_description_.audio.number_channels);
    audio_description_.sample_count += number_of_samples;
}
