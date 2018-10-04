#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/st2110/d40/packet.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list::st2110;
using namespace ebu_list;

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

    constexpr auto minimum_size = sizeof(raw_extended_sequence_number) + sizeof(raw_anc_header);
    if (sdu.view().size() < minimum_size)
    {
        return detector::status::invalid;
    }

    // start after esn
    auto p = sdu.view().data() + sizeof(raw_extended_sequence_number);
    const auto end = sdu.view().data() + sdu.view().size();
    const auto anc_header = anc_header_lens(*reinterpret_cast<const raw_anc_header*>(p));

    if ( !anc_header.field_identification() )
    {
        return detector::status::invalid;
    }

    p += sizeof(raw_anc_header);

    for (uint8_t i=0; i < anc_header.anc_count(); i++)
    {
        if (p > end)
        {
            return detector::status::invalid;
        }

        uint16_t bit_counter = 0;
        raw_anc_packet_header anc_packet_header;
        anc_packet_header.color_channel = get_bits(&p, 1, &bit_counter);
        anc_packet_header.line_num = get_bits(&p, 11, &bit_counter);
        anc_packet_header.horizontal_offset = get_bits(&p, 12, &bit_counter);
        anc_packet_header.stream_flag = get_bits(&p, 1, &bit_counter);
        anc_packet_header.stream_num = get_bits(&p, 7, &bit_counter);
        anc_packet_header.did = get_bits(&p, 10, &bit_counter);
        anc_packet_header.sdid = get_bits(&p, 10, &bit_counter);
        anc_packet_header.data_count = get_bits(&p, 10, &bit_counter);

        const auto anc_packet = anc_packet_header_lens(anc_packet_header);
        anc_packet.dump();

        if ( !anc_packet.sanity_check() )
        {
            logger()->error("Ancillary: sanity");
            return detector::status::invalid;
        }

        // skip the payload
        for (uint8_t j=0; j < anc_packet.data_count(); j++)
        {
            get_bits(&p, 10, &bit_counter);
        }

        // skip the checksum
        get_bits(&p, 10, &bit_counter);

        // skip the padding
        while (bit_counter % 32)
        {
            get_bits(&p, 1, &bit_counter);
        }
    }

    return detector_.handle_data(packet);
}

detector::details anc_format_detector::get_details() const
{
    // find a way to set description_.rate with this const signature
    return description_;
}
