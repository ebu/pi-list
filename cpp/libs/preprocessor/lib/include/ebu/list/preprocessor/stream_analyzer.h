#pragma once

#include "ebu/list/preprocessor/stream_listener.h"

namespace ebu_list::analysis
{
    nlohmann::json analyze_stream(const std::string_view &pcap_file, const std::string_view & pcap_uuid);

} // namespace ebu_list::analysis
