#pragma once

#include "ebu/list/ptp/base_message.h"
#include "ebu/list/ptp/v2/message_header.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct follow_up_body
    {
        byte80 precise_origin_timestamp;
    };

    static_assert(sizeof(follow_up_body) == 10);
#pragma pack(pop)

    class follow_up_lens
    {
    public:
        explicit follow_up_lens(const follow_up_body& h) noexcept;

        ts80 precise_origin_timestamp() const noexcept;

    private:
        const follow_up_body& h_;
    };

    class follow_up : public v2_base_message<follow_up_body, follow_up_lens>
    {
    public:
        explicit follow_up(clock::time_point packet_timestamp, v2::header&& header, oview&& sdu)
            : base_message(packet_timestamp, std::move(header), std::move(sdu))
        {
        }
    };
}
