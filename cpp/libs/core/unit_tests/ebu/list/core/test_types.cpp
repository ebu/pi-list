#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/types.h"

using namespace ebu_list;

//------------------------------------------------------------------------------

SCENARIO("net to native conversion")
{
    GIVEN("a net_uint64_t")
    {
        const auto source = net_uint64_t{0x0102030405060708};

        WHEN("we convert to native")
        {
            auto target = to_native(source);

            THEN("the value is correct") { REQUIRE(target == 0x0807060504030201); }
        }
    }

    GIVEN("a net_uint32_t")
    {
        const auto source = net_uint32_t{0x01020304};

        WHEN("we convert to native")
        {
            auto target = to_native(source);

            THEN("the value is correct") { REQUIRE(target == 0x04030201); }
        }
    }

    GIVEN("a net_uint16_t")
    {
        const auto source = net_uint16_t{0x0102};

        WHEN("we convert to native")
        {
            auto target = to_native(source);

            THEN("the value is correct") { REQUIRE(target == 0x0201); }
        }
    }
}

SCENARIO("native to net round-trip")
{
    GIVEN("a native 16-bit value")
    {
        const uint16_t source = 5030;

        WHEN("we convert to net")
        {
            auto target = to_net(source);

            THEN("the value is correct") { REQUIRE(to_native(target) == source); }
        }
    }
}
