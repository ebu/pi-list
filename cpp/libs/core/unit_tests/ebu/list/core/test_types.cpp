#include "pch.h"

#include "ebu/list/core/types.h"
#include "catch.hpp"

using namespace ebu_list;

//------------------------------------------------------------------------------

SCENARIO("net to native conversion")
{
    GIVEN("a net_uint64_t")
    {
        const auto source = net_uint64_t{ 0x0102030405060708 };

        WHEN("we convert to native")
        {
            auto target = to_native(source);

            THEN("the value is correct")
            {
                REQUIRE(target == 0x0807060504030201);
            }
        }
    }

    GIVEN("a net_uint32_t")
    {
        const auto source = net_uint32_t{ 0x01020304 };

        WHEN("we convert to native")
        {
            auto target = to_native(source);

            THEN("the value is correct")
            {
                REQUIRE(target == 0x04030201);
            }
        }
    }

    GIVEN("a net_uint16_t")
    {
        const auto source = net_uint16_t{ 0x0102 };

        WHEN("we convert to native")
        {
            auto target = to_native(source);

            THEN("the value is correct")
            {
                REQUIRE(target == 0x0201);
            }
        }
    }
}
