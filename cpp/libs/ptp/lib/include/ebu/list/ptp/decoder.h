#pragma once

#include "ebu/list/net/ipv4/address.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/ptp/message.h"
#include "ebu/list/ptp/v1/message_header.h"
#include "ebu/list/ptp/v2/announce.h"
#include "ebu/list/ptp/v2/delay_req.h"
#include "ebu/list/ptp/v2/delay_resp.h"
#include "ebu/list/ptp/v2/follow_up.h"
#include "ebu/list/ptp/v2/message_header.h"
#include "ebu/list/ptp/v2/sync.h"
#include <optional>
#include <variant>

//------------------------------------------------------------------------------

namespace ebu_list::ptp
{
    namespace endpoints
    {
        const port ptp_event   = to_port(319);
        const port ptp_general = to_port(320);

        constexpr ipv4::address default_domain_multicast_address = ipv4::address(0x810100E0); // 224.0.1.129
    }                                                                                         // namespace endpoints

    bool may_be_ptp(ipv4::address destination_address, port destination_port);
    bool may_be_ptp(ipv4::address destination_address);
    bool may_be_ptp(port p);

    namespace v2
    {
        // TODO: handle all messages?
        class other
        {
        };
    } // namespace v2

    using some_message =
        std::variant<v1::message, v2::announce, v2::sync, v2::follow_up, v2::delay_req, v2::delay_resp, v2::other>;

    using maybe_message = std::optional<some_message>;
    maybe_message decode(clock::time_point packet_timestamp, oview pdu);

    struct origin
    {
        v2::clock_id_t clock_identity;
        uint8_t subdomain_number;
    };

    bool operator==(const origin& lhs, const origin& rhs);
} // namespace ebu_list::ptp
