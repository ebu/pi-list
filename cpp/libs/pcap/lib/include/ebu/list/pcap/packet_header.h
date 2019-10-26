#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/pcap/file_header.h"

//------------------------------------------------------------------------------

namespace ebu_list::pcap
{
#pragma pack(push, 1)
    struct raw_packet_header
    {
        uint32_t ts_sec;   /* timestamp seconds */
        uint32_t ts_usec;  /* timestamp microseconds */
        uint32_t incl_len; /* number of octets of packet saved in file */
        uint32_t orig_len; /* actual length of packet */
    };

    static_assert(sizeof(raw_packet_header) == 16);
#pragma pack(pop)

    class packet_header_lens
    {
      public:
        explicit packet_header_lens(const raw_packet_header& h, const file_header_lens& file_header) noexcept;

        // number of octets of packet saved in file
        uint32_t incl_len() const noexcept;

        // actual length of packet
        uint32_t orig_len() const noexcept;

        clock::time_point timestamp() const noexcept;

      private:
        const raw_packet_header& h_;
        int nanosecond_multiplier_;
    };

    using packet_header = mapped_view<raw_packet_header, packet_header_lens, file_header_lens>;
} // namespace ebu_list::pcap
