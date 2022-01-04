#include "format_detector_handler.h"
#include "ebu/list/rtp/decoder.h"

using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::rtp;

///////////////////////////////////////////////////////////////////////////////

void format_detector_handler::on_data(const udp::datagram& datagram)
{
    auto maybe_rtp_packet = rtp::decode(datagram.ethernet_info, datagram.info, std::move(datagram.sdu));
    if(!maybe_rtp_packet)
    {
        // logger()->trace("Non-RTP datagram from {} to {}", to_string(source(datagram.info)),
        // to_string(destination(datagram.info)));
        return;
    }

    auto rtp_packet = std::move(maybe_rtp_packet.value());

    // logger()->trace("RTP datagram from {} to {}, SSRC: {:08x}", to_string(source(rtp_packet.info.udp)),
    //                to_string(destination(rtp_packet.info.udp)), rtp_packet.info.rtp.view().ssrc());

    format_detector_.on_data(rtp_packet);
}

void format_detector_handler::on_complete()
{
    format_detector_.on_complete();
}

void format_detector_handler::on_error(std::exception_ptr e)
{
    format_detector_.on_error(e);
}

detector::status_description format_detector_handler::status() const noexcept
{
    return format_detector_.status();
}

detector::details format_detector_handler::get_details() const
{
    return format_detector_.get_details();
}

detector::full_type format_detector_handler::get_full_media_type() const
{
    return format_detector_.get_full_media_type();

}

const std::map<std::string, std::vector<std::string>>& format_detector_handler::get_error_codes() const
{
    return format_detector_.get_error_codes();

}

