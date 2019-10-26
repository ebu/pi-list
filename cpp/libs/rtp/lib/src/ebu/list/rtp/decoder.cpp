#include "ebu/list/rtp/decoder.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

header_lens::header_lens(const raw_header& header) : header_(header)
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
namespace
{
    size_t get_extension_size(const raw_header* header, const byte* ext_p)
    {
        if (!header->extension) return 0;

        const auto ext         = reinterpret_cast<const extension_header*>(ext_p);
        const auto length_unit = 4;
        return sizeof(extension_header) + to_native(ext->length) * length_unit;
    }
} // namespace
//------------------------------------------------------------------------------

maybe_pdu rtp::decode(oview&& raw_pdu)
{
    if (size(raw_pdu) < ssizeof<raw_header>()) return std::nullopt;
    auto header_p = reinterpret_cast<const byte*>(raw_pdu.view().data());
    auto header   = reinterpret_cast<const raw_header*>(header_p);

    constexpr auto rtp_version = 0x02;
    if (header->version != rtp_version) return std::nullopt;

    constexpr auto csrc_size_bytes = 0x04;
    const auto csrc_size           = header->csrc_count * csrc_size_bytes;
    const auto ext_p               = header_p + sizeof(raw_header) + csrc_size;
    const auto extension_size      = get_extension_size(header, ext_p);

    const auto additional_header_space = csrc_size + extension_size;
    const ptrdiff_t total_size         = sizeof(raw_header) + additional_header_space;
    auto [header_data, sdu]            = split(std::move(raw_pdu), total_size);

    if (header_data.view().size() < total_size) return std::nullopt;

    auto h = mapped_view<raw_header, header_lens>(std::move(header_data));
    return pdu{std::move(h), std::move(sdu)};
}

maybe_packet rtp::decode(ethernet::header ethernet_info, udp::datagram_info udp_info, oview&& raw_pdu)
{
    auto p = decode(std::move(raw_pdu));
    if (!p) return std::nullopt;

    header& hl = std::get<0>(p.value());
    auto info  = packet_info(std::move(ethernet_info), std::move(udp_info), std::move(hl));

    return packet{std::move(info), std::move(std::get<1>(p.value()))};
}

packet_info::packet_info(ethernet::header&& _ethernet_info, udp::datagram_info&& _udp, header&& _rtp)
    : ethernet_info(std::move(_ethernet_info)), udp(std::move(_udp)), rtp(std::move(_rtp))
{
}
