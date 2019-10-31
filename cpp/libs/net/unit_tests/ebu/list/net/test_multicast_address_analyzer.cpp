#include "pch.h"

#include "catch2/catch.hpp"
#include "ebu/list/net/multicast_address_analyzer.h"

using namespace ebu_list;
using namespace ebu_list::ethernet;

//------------------------------------------------------------------------------
SCENARIO("multicast address analyzer")
{
    GIVEN("an IP multicast address")
    {
        WHEN("the address is within the limits")
        {
            const auto address = ipv4::from_dotted_string("228.164.200.209");
            THEN("it is correct") { REQUIRE(is_multicast_address(address)); }
        }
        WHEN("the address is in the lower limit")
        {
            const auto address = ipv4::from_dotted_string("224.0.0.1");
            THEN("it is correct") { REQUIRE(is_multicast_address(address)); }
        }
        WHEN("the address is just below the lower limit")
        {
            const auto address = ipv4::from_dotted_string("223.0.0.1");
            THEN("it is invalid") { REQUIRE(is_multicast_address(address) == false); }
        }
        WHEN("the address is in the upper limit")
        {
            const auto address = ipv4::from_dotted_string("239.254.254.254");
            THEN("it is correct") { REQUIRE(is_multicast_address(address)); }
        }
        WHEN("the address is just above the upper limit")
        {
            const auto address = ipv4::from_dotted_string("240.0.0.1");
            THEN("it is invalid") { REQUIRE(is_multicast_address(address) == false); }
        }
    }
}
