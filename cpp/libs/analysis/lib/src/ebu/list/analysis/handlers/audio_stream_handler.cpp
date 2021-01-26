#include "ebu/list/analysis/handlers/audio_stream_handler.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/math.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/st2110/d30/audio_description.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d30;

//------------------------------------------------------------------------------
namespace
{
    int channel_size_in_bytes(const audio_description& desc) { return number_of_bits(desc.encoding) / 8; }

    int sample_size(const audio_description& desc) { return desc.number_channels * channel_size_in_bytes(desc); }

    constexpr uint32_t rtp_seqnum_window = 2048;
} // namespace
//------------------------------------------------------------------------------

audio_stream_handler::audio_stream_handler(rtp::packet first_packet, serializable_stream_info info,
                                           audio_stream_details details, completion_handler ch)
    : info_(std::move(info)), audio_description_(std::move(details)), completion_handler_(std::move(ch))
{
    logger()->info("created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));

    info_.state = stream_state::ON_GOING_ANALYSIS;

    info_.network.valid_multicast_mac_address =
        is_multicast_address(first_packet.info.ethernet_info.destination_address);

    info_.network.valid_multicast_ip_address = is_multicast_address(first_packet.info.udp.destination_address);

    info_.network.multicast_address_match = is_same_multicast_address(
        first_packet.info.ethernet_info.destination_address, first_packet.info.udp.destination_address);

    info_.network.has_extended_header = first_packet.info.rtp.view().extension();

    audio_description_.first_sample_ts    = first_packet.info.rtp.view().timestamp();
    audio_description_.last_sample_ts     = audio_description_.first_sample_ts;
    audio_description_.first_packet_ts    = first_packet.info.udp.packet_time;
    using float_sec                       = std::chrono::duration<float, std::ratio<1, 1>>;
    audio_description_.samples_per_packet = static_cast<int>(to_int(audio_description_.audio.sampling) *
                                                             float_sec(audio_description_.audio.packet_time).count());
    audio_description_.packet_size = sample_size(audio_description_.audio) * audio_description_.samples_per_packet;
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
    audio_description_.last_sample_ts = packet.info.rtp.view().timestamp();
    inter_packet_spacing_.handle_data(packet);
    parse_packet(packet);
}

void audio_stream_handler::on_complete()
{
    info_.network.dscp                      = dscp_.get_info();
    info_.network.inter_packet_spacing_info = inter_packet_spacing_.get_info();

    this->on_stream_complete();
    info_.state = stream_state::ANALYZED;
    completion_handler_(*this);
}

void audio_stream_handler::on_error(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch(std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}

void audio_stream_handler::parse_packet(const rtp::packet& packet)
{
    if(packet.info.rtp.view().extension())
    {
        info_.network.has_extended_header = true;
    }

    auto& sdu = packet.sdu;

    // check if number of samples is consistent
    if(const auto actual_size = sdu.view().size(); actual_size != audio_description_.packet_size)
    {
        logger()->trace("bad packet size. Expected: {}; Actual: {}", audio_description_.packet_size, actual_size);
        return;
    }

    auto p         = sdu.view().data();
    const auto end = sdu.view().data() + sdu.view().size();
    // no extended sequence number for audio
    dscp_.handle_packet(packet);

    this->on_sample_data(cbyte_span(p, end));

    const auto size_of_channel   = number_of_bits(audio_description_.audio.encoding) / 8;
    const auto number_of_samples = (end - p) / (size_of_channel * audio_description_.audio.number_channels);
    audio_description_.sample_count += number_of_samples;
}
