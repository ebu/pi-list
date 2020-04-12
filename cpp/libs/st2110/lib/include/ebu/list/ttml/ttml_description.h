#pragma once

#include "ebu/list/sdp/media_description.h"

namespace ebu_list::ttml
{
    // nbo == network byte order
    struct nbo_header
    {
        net_uint16_t reserved;
        net_uint16_t length;
    };
    static_assert(sizeof(nbo_header) == 4);

    class header
    {
      public:
        header();
        header(nbo_header nboh);

        uint16_t reserved;
        uint16_t length;
    };

    struct description
    {
        header payload_header;
    };

    struct sdp_serializer
    {
        void write_rtpmap_line(std::vector<std::string>& current_lines,
                               const ebu_list::media::network_media_description& media_description);
        void additional_attributes(std::vector<std::string>& current_lines,
                                   const media::network_media_description& media_description);
    };
} // namespace ebu_list::ttml
