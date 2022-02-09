#pragma once

#include "ebu/list/core/types.h"
#include <array>

//------------------------------------------------------------------------------

// SRT Data Packet Header
// from https://datatracker.ietf.org/doc/html/draft-sharabayko-srt-00#section-6
//
// 0                               16                             32
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |F|                    Packet Sequence Number                   |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |P P|O|K K|R|                   Message Number                  |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |                           Timestamp                           |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |                       Destination Socket ID                   |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |                                                               |
// +                              Data                             +
// |                                                               |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

namespace ebu_list::srt
{
    class header
    {
      public:
        explicit header(cbyte_span data);

        uint32_t get_packet_sequence_number();
        uint8_t get_packet_type_flag(); // F

        uint32_t get_message_number();
        uint8_t get_retransmission_flag();
        uint8_t get_encryption_flag();      // K K
        uint8_t get_order_flag();           // O
        uint8_t get_packet_position_flag(); // P P

        uint32_t get_timestamp();

        uint32_t get_destination_socket_id();

      private:
        std::array<byte, 16> payload_header_;
    };

} // namespace ebu_list::srt
