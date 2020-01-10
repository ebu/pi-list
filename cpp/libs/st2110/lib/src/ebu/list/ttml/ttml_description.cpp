#include "ebu/list/core/platform/guid.h"
#include "ebu/list/core/types.h"
#include "ebu/list/ttml/ttml_description.h"

using namespace ebu_list;
using namespace ebu_list::media;

ttml::header::header()
    : reserved(0),
      length(0) {}

ttml::header::header(ttml::nbo_header nboh)
    : reserved(to_native(nboh.reserved)),
      length(to_native(nboh.length)) {}

void ttml::sdp_serializer::additional_attributes(std::vector<std::string>& current_lines,
                                                 const ebu_list::media::network_media_description& network_info)
{
    /* TODO: Add support for additional format and codec parameters:
             https://tools.ietf.org/html/draft-ietf-payload-rtp-ttml-06#section-11.2 */
    std::string fmtp = fmt::format("a=fmtp:{} ", network_info.network.payload_type);
    current_lines.emplace_back(fmtp);
}

void ttml::sdp_serializer::write_rtpmap_line(std::vector<std::string>& current_lines,
                                            const ebu_list::media::network_media_description& media_description)
{
    /* https://tools.ietf.org/html/draft-ietf-payload-rtp-ttml-06#section-11.2 */
    current_lines.emplace_back(fmt::format("a=rtpmap:{} ttml+xml/90000", media_description.network.payload_type));
}

