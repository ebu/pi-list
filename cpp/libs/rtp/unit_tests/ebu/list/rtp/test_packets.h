#include "pch.h"

//------------------------------------------------------------------------------
namespace ebu_list::rtp::test
{
    namespace header_1
    {
        constexpr auto version = 0x02;
        constexpr auto padding = false;
        constexpr auto extension = false;
        constexpr auto csrc_count = 0x02;
        constexpr auto marker = false;
        constexpr auto payload_type = 0x3f;
        constexpr auto sequence_number = 0xe9e2;
        constexpr auto timestamp = 0xa11078b9;
        constexpr auto ssrc = 0x131b697c;

        constexpr auto payload_size = 12;

        constexpr auto data = to_byte_array(
            0x82, 0x3f, 0xe9, 0xe2, 0xa1, 0x10, 0x78, 0xb9, 0x13, 0x1b, 0x69, 0x7c, // header
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,                         // CSRC
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00  // 12 bytes of data
        );
    }

    namespace header_with_extension
    {
        constexpr auto version = 0x02;
        constexpr auto padding = false;
        constexpr auto extension = true;
        constexpr auto csrc_count = 0x00;
        constexpr auto marker = true;
        constexpr auto payload_type = 0x67;
        constexpr auto sequence_number = 0xdac8;
        constexpr auto timestamp = 0x9af83600;
        constexpr auto ssrc = 0x47109c42;

        constexpr auto payload_size = 0x08;

        constexpr auto data = to_byte_array(
            0x90, 0xe7, 0xda, 0xc8, 0x9a, 0xf8, 0x36, 0x00, 0x47, 0x10, 0x9c, 0x42, // header
            0xbe, 0xde, // defined by profile
            0x00, 0x01, // extension length
            0x50, 0x40, 0x00, 0x00, // extension
            0xd5, 0x62, 0x03, 0x93, 0x04, 0x37, 0x06, 0x12 // payload
        );
    }
}

