#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/message.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/idioms.h"
#include <sstream>
#include <iomanip>

using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------
namespace
{
    maybe_message decode_v1(oview&& /*pdu*/)
    {
        // TODO
        return v1::message();
    }

    maybe_message decode_v2(clock::time_point packet_timestamp, oview&& pdu)
    {
        LIST_ASSERT(size(pdu) >= sizeof(v2::message_header));
        auto[header, remainder] = v2::take_header(std::move(pdu));

        switch (header.value().type())
        {
        case v2::message_type::sync:
            return v2::sync(packet_timestamp, std::move(header), std::move(remainder));

        case v2::message_type::delay_req:
            return v2::delay_req(packet_timestamp, std::move(header), std::move(remainder));

        case v2::message_type::follow_up:
            return v2::follow_up(packet_timestamp, std::move(header), std::move(remainder));

        case v2::message_type::delay_resp:
            return v2::delay_resp(packet_timestamp, std::move(header), std::move(remainder));

        default:
            return v2::other{};
        }
    }
}
//------------------------------------------------------------------------------

bool ptp::may_be_ptp(ipv4::address /*destination_address*/, port destination_port)
{
    // TODO: filtering only by port works with both multicast and unicast. Is it enough?
    // return (may_be_ptp(destination_address) && may_be_ptp(destination_port));

    return (may_be_ptp(destination_port));
}

bool ptp::may_be_ptp(ipv4::address destination_address)
{
    return (destination_address == endpoints::default_domain_multicast_address);
}

bool ptp::may_be_ptp(port p)
{
    if (p == endpoints::ptp_event) return true;
    if (p == endpoints::ptp_general) return true;
    return false;
}

maybe_message ptp::decode(clock::time_point packet_timestamp, oview&& pdu)
{
    if (size(pdu) < sizeof(common_message_header)) return std::nullopt;
    const auto common = reinterpret_cast<const common_message_header*>(pdu.view().data());
    
    if (common->version_ptp == 2)
    {
        return decode_v2(packet_timestamp, std::move(pdu));
    }
    else if (common->version_ptp == 1)
    {
        return decode_v1(std::move(pdu));
    }
    else
    {
        return std::nullopt;
    }
}

bool ptp::operator==(const origin& lhs, const origin& rhs)
{
    return std::tie(lhs.clock_identity, lhs.subdomain_number) == std::tie(rhs.clock_identity, rhs.subdomain_number);
}

