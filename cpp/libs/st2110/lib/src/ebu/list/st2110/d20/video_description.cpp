#include "ebu/list/st2110/d20/video_description.h"
#include "ebu/list/st2110/pch.h"

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

namespace
{
    std::string get_packing_mode(const video_description& video_desc)
    {
        if(video_desc.packing_mode == packing_mode_t::block)
        {
            return "2110BPM";
        }

        return "2110GPM";
    }

    std::string get_tp(const d21::compliance_profile& compliance_profile)
    {
        switch(compliance_profile)
        {
        case d21::compliance_profile::narrow: return "; TP=2110TPN";
        case d21::compliance_profile::narrow_linear: return "; TP=2110TPNL";
        case d21::compliance_profile::wide: return "; TP=2110TPW";
        default: return "";
        }
    }

    std::string get_interlace(const video_description& video_desc)
    {
        if(video_desc.scan_type == st2110::d20::video::scan_type::INTERLACED)
        {
            return "interlace; ";
        }

        return "";
    }
} // namespace

//------------------------------------------------------------------------------

media::video::info d20::get_info(video_description video)
{
    return {video.rate, video.scan_type, video.dimensions};
}

//------------------------------------------------------------------------------

st2110_20_sdp_serializer::st2110_20_sdp_serializer(const d20::video_description& video_des,
                                                   d21::compliance_profile compliance_profile)
    : video_desc_(video_des), compliance_profile_(compliance_profile)
{
}

void st2110_20_sdp_serializer::additional_attributes(
    std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& media_description)
{
    current_lines.emplace_back(fmt::format("a=source-filter: incl IN IP4 {} {}",
                                           ipv4::to_string(media_description.network.destination.addr),
                                           ipv4::to_string(media_description.network.source.addr)));

    /** Obligatory Parameters **/
    const auto payload     = media_description.network.payload_type;
    const auto sampling    = to_string(video_desc_.sampling);
    const auto width       = video_desc_.dimensions.width;
    const auto height      = video_desc_.dimensions.height;
    const auto bit_depth   = video_desc_.color_depth;
    const auto colorimetry = to_string(video_desc_.colorimetry);
    const auto rate        = to_string(video_desc_.rate);

    current_lines.emplace_back(fmt::format("a=fmtp:{} sampling={}; width={}; height={}; {}exactframerate={}; depth={}; "
                                           "colorimetry={}; PM={}; SSN=ST2110-20:2017{};",
                                           payload, sampling, width, height, get_interlace(video_desc_), rate,
                                           bit_depth, colorimetry, get_packing_mode(video_desc_),
                                           get_tp(compliance_profile_)));

    /** Optional Parameters **/
    // TODO: add max_udp a=fmtp
}

void st2110_20_sdp_serializer::write_rtpmap_line(std::vector<std::string>& current_lines,
                                                 const ebu_list::media::network_media_description& media_description)
{
    /* "a=rtpmap:<payload_type> raw/<clock_rate>" */
    current_lines.emplace_back(fmt::format("a=rtpmap:{} raw/90000", media_description.network.payload_type));
}
