#pragma once

#include "ebu/list/ptp/base_message.h"
#include "ebu/list/ptp/v2/message_header.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct sync_body
    {
        byte80 origin_timestamp;
    };

    static_assert(sizeof(sync_body) == 10);
#pragma pack(pop)

    class sync_message_lens
    {
    public:
        explicit sync_message_lens(const sync_body& h) noexcept;

        ts80 origin_timestamp() const noexcept;

    private:
        const sync_body& h_;
    };

    class sync : public v2_base_message<sync_body, sync_message_lens>
    {
    public:
        explicit sync(clock::time_point packet_timestamp, v2::header&& header, oview&& sdu)
            : base_message(packet_timestamp, std::move(header), std::move(sdu))
        {
        }
    };
}
