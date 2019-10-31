#include "pch.h"

#include "catch2/catch.hpp"
#include "ebu/list/net/ethernet/mac.h"

using namespace ebu_list;
using namespace ebu_list::ethernet;

//------------------------------------------------------------------------------
SCENARIO("mac to_string")
{
    GIVEN("a mac address")
    {
        const auto a = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));
        WHEN("we convert it to a string")
        {
            THEN("it is correctly represented") { REQUIRE(to_string(a) == "a1:b2:c3:d4:e5:f6"); }
        }
    }

    GIVEN("a mac address represented as a string")
    {
        const auto a = "a1:b2:c3:d4:e5:f6";
        WHEN("we convert it to a byte array")
        {
            THEN("it is correctly represented")
            {
                REQUIRE(to_mac_address(a) == to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));
            }
        }
    }

    GIVEN("two equal mac addresses")
    {
        const auto a = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));
        const auto b = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));
        WHEN("we compare them")
        {
            THEN("they match as equal")
            {
                REQUIRE(a == b);
                REQUIRE(a >= b);
                REQUIRE(a <= b);
            }

            THEN("they don't match as unequal") { REQUIRE_FALSE(a != b); }
        }
    }

    GIVEN("two mac addresses, one lexicographically ahead of the other")
    {
        const auto a = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF7));
        const auto b = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));

        const auto c = ethernet::mac_address(to_byte_array(0xA2, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));
        const auto d = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6));

        WHEN("we compare them")
        {
            THEN("they maintain their lexicographical order")
            {
                REQUIRE(a > b);
                REQUIRE(a >= b);
                REQUIRE(c > d);
                REQUIRE(c >= d);
                REQUIRE_FALSE(a < b);
                REQUIRE_FALSE(a <= b);
                REQUIRE_FALSE(c < d);
                REQUIRE_FALSE(c <= d);
            }
        }
    }
}

//------------------------------------------------------------------------------
