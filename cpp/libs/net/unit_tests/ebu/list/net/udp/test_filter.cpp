#include "pch.h"

#include "catch.hpp"
#include "ebu/list/net/udp/filter.h"

using namespace ebu_list;
using namespace ebu_list::udp;

SCENARIO("UDP filter filters datagrams")
{
    GIVEN("An address and port to filter")
    {
        const auto address = ipv4::from_dotted_string("192.168.1.1");
        const auto port    = to_port(10000);

        WHEN("we try to build an udp_filter without a listener")
        {
            THEN("it throws") { REQUIRE_THROWS_AS(udp_filter(nullptr, address, port), std::runtime_error); }
        }

        // todo: add tests to check the filter
    }
}
