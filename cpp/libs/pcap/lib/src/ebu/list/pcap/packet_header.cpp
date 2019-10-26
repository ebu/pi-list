#include "ebu/list/pcap/packet_header.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list::pcap;
using namespace ebu_list;

//------------------------------------------------------------------------------
packet_header_lens::packet_header_lens(const raw_packet_header& h, const file_header_lens& file_header) noexcept
    : h_(h), nanosecond_multiplier_(file_header.is_nanosecond() ? 1 : 1000)
{
}

uint32_t packet_header_lens::incl_len() const noexcept
{
    return h_.incl_len;
}

uint32_t packet_header_lens::orig_len() const noexcept
{
    return h_.orig_len;
}

clock::time_point packet_header_lens::timestamp() const noexcept
{
    const auto in_ns = uint64_t(h_.ts_sec) * 1'000'000'000 + uint64_t(h_.ts_usec) * nanosecond_multiplier_;
    return clock::time_point(std::chrono::duration_cast<clock::duration>(std::chrono::nanoseconds(in_ns)));
}
