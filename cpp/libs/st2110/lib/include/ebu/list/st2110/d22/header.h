#pragma once

#include "ebu/list/core/types.h"
#include <array>

//------------------------------------------------------------------------------

// from https://datatracker.ietf.org/doc/rfc9134/
//
// 0                               16                             32
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
// |T|K|L| I |F counter|     SEP counter     |     P counter       |
// +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

namespace ebu_list::st2110::d22
{
    class header
    {
      public:
        explicit header(cbyte_span data);
        uint16_t get_p_counter();
        uint16_t get_sep_counter();
        uint8_t get_f_counter();
        uint8_t get_interlaced();
        uint8_t get_last();
        uint8_t get_packetization_mode();
        uint8_t get_transmission_mode();

      private:
        std::array<byte, 4> payload_header_;
    };

} // namespace ebu_list::st2110::d22
