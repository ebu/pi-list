#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/ptp/v2/message_header.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v2
{
#pragma pack(push, 1)
    struct announce_body
    {
        std::array<uint8_t, 10> origintimestamp;
        net_uint16_t current_utc_offset;
        uint8_t reserved;
        uint8_t grandmaster_priority_1;
        std::array<uint8_t, 4> grandmaster_clock_quality;
        uint8_t grandmaster_priority_2;
        clock_id_t grandmaster_identity;
        net_uint16_t steps_removed;
        uint8_t time_source;
    };

    static_assert(sizeof(announce_body) == 30);
#pragma pack(pop)

    class announce_message_lens
    {
      public:
        explicit announce_message_lens(const announce_body& h) noexcept;

        const clock_id_t& grandmaster_identity() const noexcept;

      private:
        const announce_body& h_;
    };

    class announce : public v2_base_message<announce_body, announce_message_lens>
    {
      public:
        explicit announce(clock::time_point packet_timestamp, v2::header&& header, oview&& sdu)
            : base_message(packet_timestamp, std::move(header), std::move(sdu))
        {
        }
    };
} // namespace ebu_list::ptp::v2
