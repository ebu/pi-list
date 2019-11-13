#include "pch.h"

#include "catch2/catch.hpp"
#include "ebu/list/core/math.h"

using namespace ebu_list;

//------------------------------------------------------------------------------

SCENARIO("Modulo difference")
{
    GIVEN("a pair of uint16_t")
    {
        const uint16_t larger  = 0xFF10;
        const uint16_t smaller = 0x0010;

        WHEN("the larger is lhs")
        {
            const auto result = modulo_difference(larger, smaller);

            THEN("the result is correct") { REQUIRE(result == 0xFF00); }
        }

        WHEN("the smaller is lhs")
        {
            const auto result = modulo_difference(smaller, larger);

            THEN("the result is correct") { REQUIRE(result == 0x0100); }
        }
    }

    GIVEN("a pair of uint32_t")
    {
        const uint32_t larger  = 0xFF000010;
        const uint32_t smaller = 0x00000010;

        WHEN("the larger is lhs")
        {
            const auto result = modulo_difference(larger, smaller);

            THEN("the result is correct") { REQUIRE(result == 0xFF000000); }
        }

        WHEN("the smaller is lhs")
        {
            const auto result = modulo_difference(smaller, larger);

            THEN("the result is correct") { REQUIRE(result == 0x1000000); }
        }
    }

    GIVEN("a pair of uint64_t")
    {
        const uint64_t larger  = 0xFF00001000000000;
        const uint64_t smaller = 0x0000000000000010;

        WHEN("the larger is lhs")
        {
            const auto result = modulo_difference(larger, smaller);

            THEN("the result is correct") { REQUIRE(result == 0xFF00000FFFFFFFF0); }
        }

        WHEN("the smaller is lhs")
        {
            const auto result = modulo_difference(smaller, larger);

            THEN("the result is correct") { REQUIRE(result == 0xFFFFF000000010); }
        }
    }
}
