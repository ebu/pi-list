#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/ptp/base_message.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct message_header
    {
        uint8_t message_type : 4;
        uint8_t transport_specific : 4;
        uint8_t version_ptp : 4;
        uint8_t reserved_1 : 4;
        net_uint16_t message_length;
        uint8_t subdomain_number;
        uint8_t reserved_2;
        net_uint16_t flags;
        net_uint64_t correction_field;
        net_uint32_t reserved_3;
        net_uint64_t clock_identity;
        net_uint16_t source_port_identity;
        net_uint16_t sequence_id;
        uint8_t control_field;
        uint8_t log_message_interval;
    };
    static_assert(sizeof(message_header) == 34);
#pragma pack(pop)

    enum class message_type : uint8_t
    {
        sync       = 0,
        delay_req  = 1,
        follow_up  = 8,
        delay_resp = 9
    };

    class message_header_lens
    {
      public:
        explicit message_header_lens(const message_header& h) noexcept;

        message_type type() const noexcept;
        uint16_t sequence_id() const noexcept;
        uint64_t clock_identity() const noexcept;
        uint8_t subdomain_number() const noexcept;

      private:
        const message_header& h_;
    };

    class header
    {
      public:
        explicit header(mapped_oview<message_header>&& common_header);

        const message_header_lens& value() const noexcept;

      private:
        mapped_oview<message_header> common_header_;
        message_header_lens header_lens_;
    };

    // Receives a PTPv2 message, reads the header and returns
    // the parsed header and the remainder of the message.
    std::tuple<header, oview> take_header(oview&& pdu);

    template <class MessageBody, class MessageLens>
    using v2_base_message = base_message<header, MessageBody, MessageLens>;
} // namespace ebu_list::ptp::v2
