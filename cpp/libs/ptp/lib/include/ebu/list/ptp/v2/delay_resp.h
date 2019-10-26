#pragma once

#include "ebu/list/ptp/base_message.h"
#include "ebu/list/ptp/v2/message_header.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct delay_resp_body
    {
        byte80 receive_timestamp;
        byte80 requesting_port_identity;
    };

    static_assert(sizeof(delay_resp_body) == 20);
#pragma pack(pop)

    class delay_resp_lens
    {
      public:
        explicit delay_resp_lens(const delay_resp_body& h) noexcept;
        ts80 receive_timestamp() const noexcept;
        byte80 requesting_port_identity() const noexcept;

      private:
        const delay_resp_body& h_;
    };

    class delay_resp : public v2_base_message<delay_resp_body, delay_resp_lens>
    {
      public:
        explicit delay_resp(clock::time_point packet_timestamp, v2::header&& header, oview&& sdu)
            : base_message(packet_timestamp, std::move(header), std::move(sdu))
        {
        }
    };
} // namespace ebu_list::ptp::v2
