#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/ipv4/packet.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/idioms.h"
#include <sstream>
#include <iomanip>

using namespace ebu_list::ipv4;
using namespace ebu_list;

//------------------------------------------------------------------------------

std::tuple<ipv4::header, oview> ipv4::decode(oview&& pdu)
{
    LIST_ENFORCE(size(pdu) >= sizeof(ipv4::packet_header), std::runtime_error, "packet is smaller than ipv4 header");
    const auto h = reinterpret_cast<const ipv4::packet_header*>(pdu.view().data());
    const auto header_length = h->ip_hl * 4; // ip_hl is the number of 32-bit words

    const auto payload_length = to_native(h->ip_len) - header_length;

    using ipv4_header_slice = mapped_oview<ipv4::packet_header>;
    auto[ipv4_header, ipv4_payload] = split(std::move(pdu), header_length);
    ipv4_header_slice s(std::move(ipv4_header));
    header header{ s.value().ip_dst, s.value().ip_src, static_cast<protocol_type>(s.value().ip_p) };

    auto[payload, fcs] = split(std::move(ipv4_payload), payload_length);
    return { header, payload };
}

std::ostream& ipv4::operator<<(std::ostream& os, const header& h)
{
    os << "IPv4 - destination: " << ipv4::to_string(h.destination_address)
        << ", source: " << ipv4::to_string(h.source_address)
        << ", protocol: " << (h.type);

    return os;
}

std::ostream& ipv4::operator<<(std::ostream& os, protocol_type h)
{
    os << std::hex << static_cast<int>(h);
    return os;
}
