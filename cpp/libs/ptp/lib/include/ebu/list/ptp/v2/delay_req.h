#pragma once

#include "ebu/list/ptp/base_message.h"
#include "ebu/list/ptp/v2/message_header.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct delay_req_body
    {
        byte80 origin_timestamp;
    };

    static_assert(sizeof(delay_req_body) == 10);
#pragma pack(pop)

    class delay_req_lens
    {
      public:
        explicit delay_req_lens(const delay_req_body& h) noexcept;

        ts80 origin_timestamp() const noexcept;

      private:
        const delay_req_body& h_;
    };

    class delay_req : public v2_base_message<delay_req_body, delay_req_lens>
    {
      public:
        explicit delay_req(clock::time_point packet_timestamp, v2::header&& header, oview&& sdu)
            : base_message(packet_timestamp, std::move(header), std::move(sdu))
        {
        }
    };
} // namespace ebu_list::ptp::v2
