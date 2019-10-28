#pragma once

#include "ebu/list/analysis/serialization/stream_identification.h"
#include <vector>

namespace ebu_list::analysis
{
    struct tro_stream_info
    {
        int64_t tro_default_ns;
        int64_t avg_tro_ns;
        int64_t max_tro_ns;
        int64_t min_tro_ns;
    };

    // Maps stream ids to tro_info
    using tro_map = std::map<std::string, tro_stream_info>;

    tro_map calculate_average_troffset(ebu_list::path pcap_file,
                                       std::map<std::string, stream_with_details> wanted_streams);
} // namespace ebu_list::analysis
