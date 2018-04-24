#include "ebu/list/rtp/decoder.h"

using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

header_lens::header_lens(const raw_header& header)
    : header_(header)
{
}

int header_lens::version() const noexcept
{
    return header_.version;
}

bool header_lens::padding() const noexcept
{
    return header_.padding != 0;
}

bool header_lens::extension() const noexcept
{
    return header_.extension != 0;
}

int header_lens::csrc_count() const noexcept
{
    return header_.csrc_count;
}

bool header_lens::marker() const noexcept
{
    return header_.marker != 0;
}

uint8_t header_lens::payload_type() const noexcept
{
    return header_.payload_type;
}

uint16_t header_lens::sequence_number() const noexcept
{
    return to_native(header_.sequence_number);
}

uint32_t header_lens::timestamp() const noexcept
{
    return to_native(header_.timestamp);
}

uint32_t header_lens::ssrc() const noexcept
{
    return to_native(header_.ssrc);
}

//------------------------------------------------------------------------------

maybe_pdu rtp::decode(oview&& raw_pdu)
{
    if (size(raw_pdu) < sizeof(raw_header)) return std::nullopt;
    auto header = reinterpret_cast<const raw_header*>(raw_pdu.view().data());

    constexpr auto rtp_version = 0x02;
    if(header->version != rtp_version) return std::nullopt;

    constexpr auto csrc_size_bytes = 0x04;
    const auto additional_header_space = header->csrc_count * csrc_size_bytes;
    const ptrdiff_t total_size = sizeof(raw_header) + additional_header_space;
    auto[header_data, sdu] = split(std::move(raw_pdu), total_size);

    if(header_data.view().size() < total_size) return std::nullopt;

    auto h = mapped_view<raw_header, header_lens>(std::move(header_data));
    return pdu{ std::move(h), std::move(sdu) };
}

maybe_packet rtp::decode(udp::datagram_info udp_info, oview&& raw_pdu)
{
    auto p = decode(std::move(raw_pdu));
    if (!p) return std::nullopt;

    header& hl = std::get<0>(p.value());
    auto info = packet_info(std::move(udp_info), std::move(hl));

    return packet{ std::move(info), std::move(std::get<1>(p.value())) };
}

packet_info::packet_info(udp::datagram_info&& _udp, 
    header&& _rtp)
    : udp(std::move(_udp)),
    rtp(std::move(_rtp))
{
}
