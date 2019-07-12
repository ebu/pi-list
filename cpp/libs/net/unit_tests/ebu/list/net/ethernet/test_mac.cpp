#include "pch.h"

#include "ebu/list/net/ethernet/mac.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::ethernet;

//------------------------------------------------------------------------------
SCENARIO("mac to_string")
{
    GIVEN("a mac address")
    {
        const auto a = ethernet::mac_address(to_byte_array(0xA1, 0xB2, 0xC3, 0xD4, 0xE5, 0xF6 ));
        WHEN("we convert it to a string")
        {
            THEN("it is correctly represented")
            {
                REQUIRE(to_string(a) == "a1:b2:c3:d4:e5:f6");
            }
        }
    }
}

//------------------------------------------------------------------------------
