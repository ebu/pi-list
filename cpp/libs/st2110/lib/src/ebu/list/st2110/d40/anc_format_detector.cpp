#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/st2110/d40/packet.h"

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
} // namespace
//------------------------------------------------------------------------------

anc_format_detector::anc_format_detector() : detector_({maximum_packets_per_frame, minimum_packets_per_frame})
{
}

detector::status_description anc_format_detector::handle_data(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    const auto result = spacing_analyzer_.handle_data(packet);

    if(result.state == detector::state::invalid) return result;

    constexpr auto minimum_size = ssizeof<raw_extended_sequence_number>() + ssizeof<raw_anc_header>();
    if(sdu.view().size() < minimum_size)
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_ANC_NO_MINIMUM_SIZE"};
    }

    // start after esn
    auto p                = sdu.view().data() + sizeof(raw_extended_sequence_number);
    const auto end        = sdu.view().data() + sdu.view().size();
    const auto anc_header = anc_header_lens(*reinterpret_cast<const raw_anc_header*>(p));

    switch(anc_header.field_identification())
    {
    case static_cast<uint8_t>(field_kind::invalid):
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_ANC_WRONG_FIELD_VALUE"};
        break;
    case static_cast<uint8_t>(field_kind::progressive): description_.scan_type = video::scan_type::PROGRESSIVE; break;
    default: description_.scan_type = video::scan_type::INTERLACED; break;
    }

    if(anc_header.reserved_bit())
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_ANC_WRONG_RESERVED_BIT"};
    }

    p += sizeof(raw_anc_header);

    /* empty data is ok but must announced as such */
    if((!anc_header.anc_count() && anc_header.length()) || (anc_header.anc_count() && !anc_header.length()))
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_ANC_WRONG_HEADER"};
    }

    /*
     * for every embedded sub-stream in the packet:
     * - get the header
     * - discard the whole rtp stream if the header doesn't match ancillary
     * - walk through the payload+checksum+padding
     * - return if error detected but do not invalidate because the
     *   capture may still contains valid other sub-streams
     */
    for(uint8_t i = 0; i < anc_header.anc_count(); i++)
    {
        if(p > end)
        {
            /* could be truncated */
            return detector::status_description{/*.state*/ detector::state::detecting,
                                                /*.error_code*/ "STATUS_CODE_ANC_DETECTING"};
        }

        uint16_t bit_counter = 0;
        raw_anc_packet_header anc_packet_header;
        anc_packet_header.color_channel     = get_bits<1>(&p, &bit_counter);
        anc_packet_header.line_num          = get_bits<11>(&p, &bit_counter);
        anc_packet_header.horizontal_offset = get_bits<12>(&p, &bit_counter);
        anc_packet_header.stream_flag       = get_bits<1>(&p, &bit_counter);
        anc_packet_header.stream_num        = get_bits<7>(&p, &bit_counter);
        anc_packet_header.did               = get_bits<10>(&p, &bit_counter);
        anc_packet_header.sdid              = get_bits<10>(&p, &bit_counter);
        anc_packet_header.data_count        = get_bits<10>(&p, &bit_counter);

        const auto anc_packet = anc_packet_header_lens(anc_packet_header);

        /* let's give a chance */
        if(!anc_packet.sanity_check())
        {
            logger()->debug("Ancillary: header insanity");
            return detector::status_description{/*.state*/ detector::state::detecting,
                                                /*.error_code*/ "STATUS_CODE_ANC_DETECTING"};
        }

        auto s = anc_sub_stream(anc_packet);
        if(!s.is_valid())
        {
            logger()->debug("Ancillary: invalid data type ({}-{})", anc_packet.did(), anc_packet.sdid());
            /* it could be worth trying to return invalid */
            return detector::status_description{/*.state*/ detector::state::detecting,
                                                /*.error_code*/ "STATUS_CODE_ANC_DETECTING"};
        }

        /* detect and save new sub-streams */
        auto it = std::find(description_.sub_streams.begin(), description_.sub_streams.end(), s);
        if(it == description_.sub_streams.end())
        {
            logger()->info("Ancillary: new stream: {}: {}", to_string(s.did_sdid()), to_description(s.did_sdid()));
            description_.sub_streams.push_back(s);
            it = std::find(description_.sub_streams.begin(), description_.sub_streams.end(), s);
        }

        /* walkthrough the payload */
        for(uint8_t j = 0; j < anc_packet.data_count(); j++)
        {
            get_bits<10>(&p, &bit_counter);
        }

        /* crc */
        get_bits<10>(&p, &bit_counter);

        /* skip the anc padding (!= rtp padding) */
        while(bit_counter % 32)
        {
            get_bits<1>(&p, &bit_counter);
        }
    }

    if(p > end)
    {
        /* could be truncated */
        logger()->warn("Ancillary stream shorter than expected");
        return detector::status_description{/*.state*/ detector::state::detecting,
                                            /*.error_code*/ "STATUS_CODE_ANC_DETECTING"};
    }
    else if((p < end) && !packet.info.rtp.view().padding())
    {
        logger()->warn("Ancillary stream longer than expected");
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_ANC_PKT_TOO_LONG"};
    }
    else if(packet.info.rtp.view().padding() && !rtp::validate_padding(p, end))
    {
        logger()->warn("Ancillary wrong padding value");
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_ANC_WRONG_PADDING"};
    }

    const auto res = detector_.handle_data(packet);

    return res;
}

detector::details anc_format_detector::get_details() const
{
    auto result = anc_description{};

    result.packets_per_frame = detector_.packets_per_frame();
    result.rate              = detector_.rate();
    result.scan_type         = description_.scan_type;
    for(auto& it : description_.sub_streams)
    {
        result.sub_streams.push_back(it);
    }

    return result;
}
