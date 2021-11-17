#include "ebu/list/ttml/ttml_format_detector.h"
#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/st2110/d40/header.h"

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::st2110;

ttml::format_detector::format_detector()
{
}

detector::status_description ttml::format_detector::handle_data(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    constexpr auto minimum_size = ssizeof<nbo_header>();
    if(sdu.view().size() < minimum_size)
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_TTML_NO_MINIMUM_SIZE"};
    }

    auto ptr                    = sdu.view().data();
    const auto end              = sdu.view().data() + sdu.view().size();
    const auto payload_header   = header(*reinterpret_cast<const nbo_header*>(ptr));
    description_.payload_header = payload_header;
    ptr += sizeof(nbo_header);

    if(end - ptr < payload_header.length)
    {
        logger()->warn("TTML user content shorter than declared in Length field");
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_TTML_INVALID_LENGTH"};
    }

    const auto ptr_char = reinterpret_cast<char const*>(ptr);
    const auto end_char = reinterpret_cast<char const*>(end);

    document_.append(ptr_char, end_char);

    if(!packet.info.rtp.view().marker())
    {
        return detector::status_description{detector::state::detecting, ""};
    }

    // If this is the last packet of the document, check if the end of the payload is "</tt:tt>"
    // TODO: this only works for UTF-8

    const std::string_view closing_tag("</tt:tt>");
    if(document_.size() < closing_tag.size())
    {
        logger()->warn("TTML user content: not xml start tag");
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_TTML_INVALID_LENGTH"};
    }

    const auto last_segment = std::string_view(end_char - closing_tag.size(), closing_tag.size());

    if(last_segment == closing_tag)
    {
        return detector::status_description{/*.state*/ detector::state::valid,
                                            /*.error_code*/ "STATUS_CODE_TTML_VALID_DOCUMENT"};
    }

    return detector::status_description{/*.state*/ detector::state::invalid,
                                        /*.error_code*/ "STATUS_CODE_TTML_INVALID_DOCUMENT"};
}

detector::details ttml::format_detector::get_details() const
{
    return description_;
}

std::string ttml::format_detector::get_full_media_type() const
{
    return "application/ttml+xml";
}
