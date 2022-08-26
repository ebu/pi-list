#include "ebu/list/st2110/d22/video_format_detector.h"
#include "ebu/list/st2110/d22/header.h"
#include "ebu/list/st2110/d20/video_description.h"

using namespace ebu_list::st2110::d22;
using namespace ebu_list::st2110;
using namespace ebu_list;

namespace
{
    constexpr auto maximum_packets_per_frame = 10000;
    constexpr auto minimum_packets_per_frame = 20;
} // namespace

video_format_detector::video_format_detector() : detector_({maximum_packets_per_frame, minimum_packets_per_frame})
{
}

detector::status_description video_format_detector::handle_data(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;
    // Verify packet payload header to see if matches payload header of jpeg xs
    if(static_cast<size_t>(sdu.view().size()) < sizeof(uint32_t))
    {
        // logger()->error("Packet size smaller than minimum: {}", sdu.view().size());
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_VIDEO_INVALID_PAYLOAD_SIZE"};
    }
    auto payload_header    = header(sdu);
    auto transmission_mode = payload_header.get_transmission_mode();
    if(transmission_mode != 1)
    {
        logger()->info("Transmission mode: {}", transmission_mode);
//        return detector::status_description{/*.state*/ detector::state::invalid,
//                                            /*.error_code*/ "STATUS_CODE_VIDEO_INVALID_TRANSMISSION_MODE"};
    }
    // Verify if packetization mode field is the same for all packets of the RTP stream
    auto payload_packetization_mode = payload_header.get_packetization_mode();
    if(!packetization_mode.has_value())
    {
        packetization_mode = payload_packetization_mode;
    }
    else if(payload_packetization_mode != packetization_mode.value())
    {
        logger()->info("Inconsistent packetization mode. Header: {}. Payload: {}", packetization_mode.value(), payload_packetization_mode);
//        return detector::status_description{/*.state*/ detector::state::invalid,
//                                            /*.error_code*/ "STATUS_CODE_VIDEO_INVALID_PACKETIZATION_MODE"};
    }

    // Verify if last packet is marked when it is marked the end of the frame
    if(packet.info.rtp().marker() && packetization_mode.value() == 0)
    {
        auto last_packet = payload_header.get_last();
        if(last_packet != 1)
        {
            return detector::status_description{/*.state*/ detector::state::invalid,
                                                /*.error_code*/ "STATUS_CODE_VIDEO_INVALID_LAST_PACKET"};
        }
    }

    // Check packets rtp timestamps
    return detector_.handle_data(packet);
}

detector::details video_format_detector::get_details() const
{
    // TODO: define a specific descriptor for -22
    auto result              = d20::video_description{};
    result.packets_per_frame = detector_.packets_per_frame();
    result.rate              = detector_.rate();

    return result;
}

detector::full_type video_format_detector::get_full_media_type() const
{
    return "video/jxsv";
}

detector::transport_type video_format_detector::get_transport_type() const
{
    return "RTP";
}
