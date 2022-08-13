#pragma once

#include "ebu/list/preprocessor/stream_listener.h"
#include "ebu/list/srt/srt_stream_listener.h"

namespace ebu_list::analysis
{
    struct media_type_map_entry
    {
        struct destination_t
        {
            ipv4::address a;
            port p;
        };

        destination_t destination;
    };

    bool operator<(const media_type_map_entry& lhs, const media_type_map_entry& rhs);

    using media_type_mapping = std::map<media_type_map_entry, media::full_media_type>;
    struct analysis_options_t
    {
        std::string transport_type;
        media_type_mapping media_types;
    };

    nlohmann::json analyze_stream(const std::string_view& pcap_file, const std::string_view& pcap_uuid,
                                  analysis_options_t&& options);

} // namespace ebu_list::analysis
