#include "ebu/list/ttml/ttml_format_detector.h"
#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/st2110/d40/header.h"
#include "ebu/list/st2110/pch.h"

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

    if(end - ptr < 6)
    {
        logger()->warn("TTML user content: not xml start tag");
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_TTML_INVALID_LENGTH"};
    }

    const auto c1        = *ptr++;
    const auto c2        = *ptr++;
    const auto c3        = *ptr++;
    const auto c4        = *ptr++;
    const auto c5        = *ptr++;
    const auto c6        = *ptr++;

    if(c1 != std::byte('<') || c2 != std::byte('t') || c3 != std::byte('t') || c4 != std::byte(':') ||
       c5 != std::byte('t') || c6 != std::byte('t'))
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_TTML_INVALID_DOCUMENT"};
    }

    return detector::status_description{/*.state*/ detector::state::valid,
                                        /*.error_code*/ "STATUS_CODE_TTML_VALID_DOCUMENT"};
}

detector::details ttml::format_detector::get_details() const
{
    return description_;
}
