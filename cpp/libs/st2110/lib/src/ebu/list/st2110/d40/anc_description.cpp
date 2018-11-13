#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/st2110/d40/anc_description.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list::media;
namespace ancillary = ebu_list::media::anc;

anc_stream::anc_stream(uint8_t did, uint8_t sdid, uint8_t num)
    : did_sdid_(static_cast<ancillary::did_sdid>((did << 8) + sdid))
    , num_(num)
{
    check();
}

anc_stream::anc_stream(uint16_t did_sdid, uint8_t num)
    : did_sdid_(static_cast<ancillary::did_sdid>(did_sdid))
    , num_(num)
{
    check();
}

void anc_stream::check()
{
    for(auto &it : ancillary::stream_types)
    {
        if(it.second == did_sdid_){
            return;
        }
    }
    did_sdid_ = ancillary::did_sdid::UNKNOWN;
}

bool anc_stream::operator==(const anc_stream& other)
{
    return ((other.did_sdid() == this->did_sdid()) && (other.num() == this->num()));
}

ancillary::did_sdid anc_stream::did_sdid() const
{
    return did_sdid_;
}

uint8_t anc_stream::num() const
{
    return num_;
}

bool anc_stream::is_valid() const
{
    return (did_sdid_ != ancillary::did_sdid::UNKNOWN);
}

//-----------------------------------------------

st2110_40_sdp_serializer::st2110_40_sdp_serializer(const d40::anc_description& anc_des)
    : anc_desc_(anc_des)
{
}

void st2110_40_sdp_serializer::additional_attributes(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& network_info)
{
    current_lines.emplace_back(fmt::format("a=source-filter:incl IN IP4 {} {}",
                ipv4::to_string(network_info.network.destination.addr),
                ipv4::to_string(network_info.network.source.addr)));

    /** Obligatory Parameters **/
    // https://tools.ietf.org/id/draft-ietf-payload-rtp-ancillary-10.xml
    std::string fmtp = fmt::format("a=fmtp:{} ", network_info.network.payload_type);
    for (const auto s : anc_desc_.streams)
    {
        fmtp += fmt::format("DID_SDID={{0x{},0x{}}};",
                std::to_string((static_cast<uint16_t>(s.did_sdid()) >> 8) & 0xFF),
                std::to_string(static_cast<uint16_t>(s.did_sdid()) & 0xFF));
    }
    current_lines.emplace_back(fmtp);

    // todo: add PTP
    //current_lines.emplace_back("a=ts-refclk:ptp=IEEE1588-2008:39-A7-94-FF-FE-07-CB-D0:37");
    //current_lines.emplace_back("a=mediaclk:direct=0");
}

void st2110_40_sdp_serializer::write_rtpmap_line(std::vector<std::string>& current_lines, const ebu_list::media::network_media_description& media_description)
{
    // "a=rtpmap:<payload_type> smpte291/<clock_rate>"
    current_lines.emplace_back(fmt::format("a=rtpmap:{} smpte291/90000", media_description.network.payload_type));
}
