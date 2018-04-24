#pragma once

#include "ebu/list/pcap/file_header.h"
#include "ebu/list/pcap/packet_header.h"
#include "ebu/list/core/io/chunked_data_source.h"
#include <optional>

//------------------------------------------------------------------------------

namespace ebu_list::pcap
{
    using maybe_header = std::optional<file_header>;
    maybe_header read_header(chunked_data_source& source) noexcept;

    struct packet
    {
        packet_header pcap_header;
        oview data;
    };

    using maybe_packet = std::optional<packet>;

    maybe_packet read_packet(const file_header_lens& header, chunked_data_source& source) noexcept;
}
