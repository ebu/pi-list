#include "ebu/list/pcap/reader.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"

using namespace ebu_list::pcap;
using namespace ebu_list;

//------------------------------------------------------------------------------
maybe_header pcap::read_header(chunked_data_source& source) noexcept
{
    auto s = source.try_read_exactly(sizeof(raw_file_header));
    if (size(s) < sizeof(raw_file_header)) return std::nullopt;

    auto h = file_header(std::move(s));
    if(!h().is_valid()) return std::nullopt;

    return h;
}

maybe_packet pcap::read_packet(const file_header_lens& header, chunked_data_source& source) noexcept
{
    auto s = source.try_read_exactly(sizeof(raw_packet_header));
    if (size(s) < sizeof(raw_packet_header)) return std::nullopt;

    auto ph = packet_header(std::move(s), header);

    auto data = source.try_read_exactly(ph().incl_len());
    if (size(data) != ph().incl_len()) return std::nullopt;

    const auto payload_len = ph().orig_len();
    if (data.view().size_bytes() == payload_len)
    {
        return packet{ std::move(ph),  std::move(data) };
    }
    else
    {
        // TODO: signal that we are padding the data
        assert(payload_len >= data.view().size_bytes());
        const auto padding_size = payload_len - data.view().size_bytes();
        auto padding = oview(source.get_factory().get_buffer(padding_size), 0, padding_size);
        auto padded_data = merge(source.get_factory(), std::move(data), std::move(padding));
        assert(padded_data.view().size_bytes() == payload_len);
        return packet{ std::move(ph),  std::move(padded_data) };
    }
}
