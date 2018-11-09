#include "ebu/list/sdp/sdp_writer.h"

#include <fstream>
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::sdp;

sdp_writer::sdp_writer(const sdp_global_settings& settings)
{
    // global info
    lines_.emplace_back("v=0");
    lines_.emplace_back("o=- 1 1 IN IP4 192.168.100.2");
    lines_.emplace_back(fmt::format("s={}", settings.session_name));
    lines_.emplace_back(fmt::format("i={}", settings.session_info));

    // timing info
    lines_.emplace_back("t=0 0"); // todo: add PTP
    lines_.emplace_back("a=recvonly");
}

std::vector<std::string> sdp_writer::sdp() const
{
    return lines_;
}

void sdp_writer::write_to(const ebu_list::path &path) const
{
    std::ofstream o(path.string());

    for( const auto& line : lines_ )
    {
        o << line << std::endl;
    }
}

void sdp_writer::write_media_line(const media::network_media_description &media_description)
{
    LIST_ENFORCE(
            media_description.type == media::media_type::VIDEO ||
            media_description.type == media::media_type::AUDIO ||
            media_description.type == media::media_type::ANCILLARY_DATA,
            std::invalid_argument,
            "Only audio and video supported on SDP serialization"
    );

    const std::string media_type_string = media_description.type == media::media_type::VIDEO ? "video" :
        media_description.type == media::media_type::AUDIO ? "audio" : "ancillary";
    const auto port = ebu_list::to_string(media_description.network.destination.p);

    // "m=<media_type> <port> RTP/AVP <payload_type>"
    lines_.emplace_back(fmt::format("m={} {} RTP/AVP {}", media_type_string, port, media_description.network.payload_type));
}

void sdp_writer::write_connection_line(const media::network_media_description &media_description)
{
    // "c=IN IP4 <IP>/<TTL>"
    lines_.emplace_back(fmt::format("c=IN IP4 {}/32", ipv4::to_string(media_description.network.destination.addr)));
}

sdp_writer& sdp_writer::add_media(const ebu_list::media::network_media_description& media_description)
{
    write_media_line(media_description);
    write_connection_line(media_description);

    return *this;
}
