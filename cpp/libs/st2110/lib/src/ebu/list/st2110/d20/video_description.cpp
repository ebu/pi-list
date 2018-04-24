#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d20/video_description.h"

using namespace ebu_list::media;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;

void st2110_20_sdp_serializer::additional_attributes(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& network_info)
{
    // todo: implement source-filters (rfc4570)
    //current_lines.emplace_back("a=source-filter:incl IN IP4 239.100.9.10 192.168.100.2");

    /** Obligatory Parameters **/
    const auto payload = network_info.network.payload_type;
    const auto sampling = to_string(video_desc_.sampling);
    const auto width = video_desc_.dimensions.width;
    const auto height = video_desc_.dimensions.height;
    const auto bit_depth = video_desc_.color_depth;
    const auto colorimetry = to_string(video_desc_.colorimetry);
    const auto rate = to_string(video_desc_.rate);

    current_lines.emplace_back(fmt::format(
            "a=fmtp:{} sampling={}; width={}; height={}; exactframerate={}; depth={}; colorimetry={}; PM=2110GPM; SSN=ST2110-20:2017",
                        payload, sampling, width, height, rate, bit_depth, colorimetry
    ));

    /** Optional Parameters **/
    // todo: add max_udp and interlace fields to a=fmtp

    // todo: add PTP
    //current_lines.emplace_back("a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37");
    //current_lines.emplace_back("a=mediaclk:direct=0");
}

void st2110_20_sdp_serializer::write_rtpmap_line(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& media_description)
{
    // "a=rtpmap:<payload_type> raw/<clock_rate>"
    current_lines.emplace_back(fmt::format("a=rtpmap:{} raw/90000", media_description.network.payload_type));
}

st2110_20_sdp_serializer::st2110_20_sdp_serializer(const d20::video_description& video_des)
    : video_desc_(video_des)
{
}