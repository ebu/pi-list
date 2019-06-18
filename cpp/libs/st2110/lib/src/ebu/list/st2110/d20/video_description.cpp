#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d20/video_description.h"

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

media::video::info d20::get_info(video_description video)
{
    return { video.rate, video.scan_type, video.dimensions };
}

//------------------------------------------------------------------------------

st2110_20_sdp_serializer::st2110_20_sdp_serializer(const d20::video_description& video_des)
    : video_desc_(video_des)
{
}

void st2110_20_sdp_serializer::additional_attributes(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& media_description)
{
    current_lines.emplace_back(fmt::format("a=source-filter:incl IN IP4 {} {}",
                ipv4::to_string(media_description.network.destination.addr),
                ipv4::to_string(media_description.network.source.addr)));

    /** Obligatory Parameters **/
    const auto payload = media_description.network.payload_type;
    const auto sampling = to_string(video_desc_.sampling);
    const auto width = video_desc_.dimensions.width;
    const auto height = video_desc_.dimensions.height;
    const auto bit_depth = video_desc_.color_depth;
    const auto colorimetry = to_string(video_desc_.colorimetry);
    const auto rate = to_string(video_desc_.rate);

    current_lines.emplace_back(fmt::format(
            "a=fmtp:{} sampling={}; width={}; height={}; exactframerate={}; depth={}; colorimetry={}; PM=2110GPM; SSN=ST2110-20:2017;",
                        payload, sampling, width, height, rate, bit_depth, colorimetry
    ));

    /** Optional Parameters **/
    // todo: add max_udp and interlace fields to a=fmtp
}

void st2110_20_sdp_serializer::write_rtpmap_line(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& media_description)
{
    /* "a=rtpmap:<payload_type> raw/<clock_rate>" */
    current_lines.emplace_back(fmt::format("a=rtpmap:{} raw/90000", media_description.network.payload_type));
}
