#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/st2110/d40/packet.h"
#include "ebu/list/core/media/anc_description.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list::st2110;
using namespace ebu_list;
using namespace ebu_list::media::anc;
using namespace ebu_list::media;

//------------------------------------------------------------------------------
namespace
{
    constexpr auto maximum_packets_per_frame = 20;
    constexpr auto minimum_packets_per_frame = 1;
}
//------------------------------------------------------------------------------

anc_format_detector::anc_format_detector()
    : detector_({ maximum_packets_per_frame, minimum_packets_per_frame })
{
}

detector::status anc_format_detector::handle_data(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    if (spacing_analyzer_.handle_data(packet) == detector::status::invalid)
    {
        return detector::status::invalid;
    }

    constexpr auto minimum_size = sizeof(raw_extended_sequence_number) + sizeof(raw_anc_header);
    if (sdu.view().size() < minimum_size)
    {
        return detector::status::invalid;
    }

    // start after esn
    auto p = sdu.view().data() + sizeof(raw_extended_sequence_number);
    const auto end = sdu.view().data() + sdu.view().size();
    const auto anc_header = anc_header_lens(*reinterpret_cast<const raw_anc_header*>(p));

    // TODO: signal if the data is progressive or interlaced
    // TODO: report if field is invalid
    if (anc_header.field_identification() == static_cast<uint8_t>(field_kind::invalid))
    {
        logger()->info("Ancillary: field identification is invalid");
    }

    p += sizeof(raw_anc_header);

    /*
     * for every embedded stream in the packet:
     * - get the header
     * - discard the whole rtp stream if the header doesn't match ancillary
     * - walk through the payload+checksum+padding
     * - verify the parity for every word and checksum
     * - increment an error counter for every stream
     * - return if error detected but do not invalidate because the
     *   capture may still contains valid other streams
     */
    for (uint8_t i=0; i < anc_header.anc_count(); i++)
    {
        logger()->trace("Ancillary: data count : {}", i);

        if (p > end)
        {
            /* could be truncated */
            return detector::status::detecting;
        }

        uint16_t bit_counter = 0;
        raw_anc_packet_header anc_packet_header;
        anc_packet_header.color_channel = get_bits<1>(&p, &bit_counter);
        anc_packet_header.line_num = get_bits<11>(&p, &bit_counter);
        anc_packet_header.horizontal_offset = get_bits<12>(&p, &bit_counter);
        anc_packet_header.stream_flag = get_bits<1>(&p, &bit_counter);
        anc_packet_header.stream_num = get_bits<7>(&p, &bit_counter);
        anc_packet_header.did = get_bits<10>(&p, &bit_counter);
        anc_packet_header.sdid = get_bits<10>(&p, &bit_counter);
        anc_packet_header.data_count = get_bits<10>(&p, &bit_counter);

        const auto anc_packet = anc_packet_header_lens(anc_packet_header);
        anc_packet.dump();

        if ( !anc_packet.sanity_check() )
        {
            return detector::status::detecting;
        }

        auto stream = anc_stream((anc_packet.did() << 8) + anc_packet.sdid(), anc_packet.stream_num());
        if (!stream.is_valid())
        {
            logger()->trace("Ancillary: stream invalid");
            return detector::status::detecting;
        }

        auto it = std::find(description_.streams.begin(), description_.streams.end(), stream);
        if (it == description_.streams.end())
        {
            logger()->info("Ancillary: new stream: {}: {}", to_string(stream.did_sdid()), to_description(stream.did_sdid()));
            description_.streams.push_back(stream);
            it = std::find(description_.streams.begin(), description_.streams.end(), stream);
        }

        /* checksum must be perform on 9-bit so raw header is used here */
        uint16_t sum = anc_packet_header.did + anc_packet_header.sdid + anc_packet_header.data_count;
        uint16_t errors = it->errors();

        /* walkthrough the payload */
        for (uint8_t j=0; j < anc_packet.data_count(); j++)
        {
            const uint16_t word = get_bits<10>(&p, &bit_counter);
            if (! sanity_check_word(word))
            {
                errors++;
            }
            sum += word;
        }

        /* validate the checksum */
        if (! sanity_check_sum(get_bits<10>(&p, &bit_counter), sum))
        {
            errors++;
        }

        /* skip the padding */
        while (bit_counter % 32)
        {
            get_bits<1>(&p, &bit_counter);
        }

        if(errors)
        {
            logger()->warn("Ancillary stream payload has {} error ", errors);
        }
        it->errors(errors);
    }

    if (p > end)
    {
        /* could be truncated */
        logger()->warn("Ancillary stream shorter than expected");
        return detector::status::detecting;
    }

    const auto res = detector_.handle_data(packet);

    /* analysis terminated but no valid ancillary found */
    if ((res != detector::status::detecting) && (! description_.streams.size()))
    {
        logger()->warn("Ancillary, no valid stream found");
        return detector::status::invalid;
    }

    return  res;
}

detector::details anc_format_detector::get_details() const
{
    auto result = anc_description{};
    result.rate = detector_.rate();

    result.packets_per_frame = detector_.packets_pre_frame();
    result.rate = detector_.rate();

    return description_;
}
