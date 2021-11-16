#include "catch2/catch.hpp"
#include "ebu/list/core/types.h"
#include "ebu/list/st2110/d22/header.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d22;

//------------------------------------------------------------------------------
SCENARIO("st2110-22 payload header")
{
    GIVEN("a buffer with 4 bytes")
    {
        const auto buffer = to_byte_array(0x80, 0xC0, 0, 0x4B);
        // byte buffer[4] = {byte(0), byte(0), byte(0), byte(0x4B)};

        WHEN("we check the fields of the payload header")
        {
            auto payload_header = header(buffer);

            auto p_counter         = payload_header.get_p_counter();
            auto sep_counter       = payload_header.get_sep_counter();
            auto f_counter          = payload_header.get_f_counter();
            auto interlaced         = payload_header.get_interlaced();
            auto last               = payload_header.get_last();
            auto packetization_mode = payload_header.get_packetization_mode();
            auto transmission_mode  = payload_header.get_transmission_mode();

            THEN("p counter must be 0x4B") { REQUIRE(p_counter == 0x4B); }
            THEN("sep counter must be 0") { REQUIRE(sep_counter == 0); }
            THEN("f counter must be 0") { REQUIRE(f_counter == 3); }
            THEN("interlaced must be 0") { REQUIRE(interlaced == 0); }
            THEN("last must be 0") { REQUIRE(last == 0); }
            THEN("packetization_mode must be 0") { REQUIRE(packetization_mode == 0); }
            THEN("transmission_mode must be 0") { REQUIRE(transmission_mode == 1); }
        }
    }

    GIVEN("a buffer with 4 bytes")
    {
        const auto buffer = to_byte_array(0x8A, 0x40, 0x48, 0x26);

        WHEN("we check the fields of the payload header")
        {
            auto payload_header = header(buffer);

            auto p_counter         = payload_header.get_p_counter();
            auto sep_counter       = payload_header.get_sep_counter();
            auto f_counter          = payload_header.get_f_counter();
            auto interlaced         = payload_header.get_interlaced();
            auto last               = payload_header.get_last();
            auto packetization_mode = payload_header.get_packetization_mode();
            auto transmission_mode  = payload_header.get_transmission_mode();

            THEN("p counter must be 0x4B") { REQUIRE(p_counter == 0x26); }
            THEN("sep counter must be 0") { REQUIRE(sep_counter == 9); }
            THEN("f counter must be 0") { REQUIRE(f_counter == 9); }
            THEN("interlaced must be 0") { REQUIRE(interlaced == 1); }
            THEN("last must be 0") { REQUIRE(last == 0); }
            THEN("packetization_mode must be 0") { REQUIRE(packetization_mode == 0); }
            THEN("transmission_mode must be 0") { REQUIRE(transmission_mode == 1); }
        }
    }

    GIVEN("a buffer with 4 bytes")
    {
        const auto buffer = to_byte_array(0, 0x3F, 0xFF, 0xFF);

        WHEN("we check the fields of the payload header")
        {
            auto payload_header = header(buffer);

            auto p_counter         = payload_header.get_p_counter();
            auto sep_counter       = payload_header.get_sep_counter();
            auto f_counter          = payload_header.get_f_counter();
            auto interlaced         = payload_header.get_interlaced();
            auto last               = payload_header.get_last();
            auto packetization_mode = payload_header.get_packetization_mode();
            auto transmission_mode  = payload_header.get_transmission_mode();

            THEN("p counter must be 0x4B") { REQUIRE(p_counter == 0x07FF); }
            THEN("sep counter must be 0") { REQUIRE(sep_counter == 0x07FF); }
            THEN("f counter must be 0") { REQUIRE(f_counter == 0); }
            THEN("interlaced must be 0") { REQUIRE(interlaced == 0); }
            THEN("last must be 0") { REQUIRE(last == 0); }
            THEN("packetization_mode must be 0") { REQUIRE(packetization_mode == 0); }
            THEN("transmission_mode must be 0") { REQUIRE(transmission_mode == 0); }
        }
    }
}