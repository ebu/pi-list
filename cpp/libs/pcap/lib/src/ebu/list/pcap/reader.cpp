#include "ebu/list/pcap/reader.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"

using namespace ebu_list::pcap;
using namespace ebu_list;

//------------------------------------------------------------------------------

constexpr auto max_packet_size = 0x40000;

maybe_header pcap::read_header(chunked_data_source& source) noexcept
{
    auto s = source.try_read_exactly(sizeof(raw_file_header));
    if(size(s) < ssizeof<raw_file_header>()) return std::nullopt;

    auto h = file_header(std::move(s));
    if(!h().is_valid()) return std::nullopt;

    return h;
}

maybe_packet pcap::read_packet(const file_header_lens& header, chunked_data_source& source)
{
    auto s = source.try_read_exactly(sizeof(raw_packet_header));
    if(size(s) < ssizeof<raw_packet_header>()) return std::nullopt;

    auto ph = packet_header(std::move(s), header);

    const auto included_len = ph().incl_len();

    if(included_len > max_packet_size)
    {
        const auto message = fmt::format("Request to read invalid packet size (0x{:x}) at position 0x{:x}",
                                         included_len, source.get_current_offset());
        logger()->error(message);
        throw std::runtime_error(message);
    }

    auto data = source.try_read_exactly(included_len);
    if(size(data) != included_len) return std::nullopt;

    const auto payload_len = ph().orig_len();
    if(data.view().size_bytes() >= payload_len)
    {
        const auto was_padded = false;
        return packet{std::move(ph), std::move(data), was_padded};
    }
    else
    {
        assert(payload_len >= data.view().size_bytes());
        const auto padding_size = payload_len - data.view().size_bytes();
        auto padding            = oview(source.get_factory().get_buffer(padding_size), 0, padding_size);
        auto padded_data        = merge(source.get_factory(), std::move(data), std::move(padding));
        assert(padded_data.view().size_bytes() == payload_len);
        const auto was_padded = true;
        return packet{std::move(ph), std::move(padded_data), was_padded};
    }
}
