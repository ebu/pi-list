#include "pch.h"

//------------------------------------------------------------------------------
namespace ebu_list::rtp::test
{
    namespace header_1
    {
        constexpr auto version = 0x02;
        constexpr auto padding = false;
        constexpr auto extension = true;
        constexpr auto csrc_count = 0x02;
        constexpr auto marker = false;
        constexpr auto payload_type = 0x3f;
        constexpr auto sequence_number = 0xe9e2;
        constexpr auto timestamp = 0xa11078b9;
        constexpr auto ssrc = 0x131b697c;
        
        constexpr auto payload_size = 12;

        constexpr auto data = to_byte_array(
            0x92, 0x3f, 0xe9, 0xe2, 0xa1, 0x10, 0x78, 0xb9, 0x13, 0x1b, 0x69, 0x7c, // header
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,                         // CSRC
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // 12 bytes of data
        );
    }
}
