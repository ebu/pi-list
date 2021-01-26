#include "catch2/catch.hpp"
#include "ebu/list/net/ipv4/address.h"
using namespace ebu_list;
using namespace ebu_list::ipv4;
//------------------------------------------------------------------------------

SCENARIO("IPv4 addresses and strings")
{
    GIVEN("an address in network format")
    {
        const auto a = address(0x8f07a8c0); // 192.168.7.143, network order

        WHEN("we convert it to string")
        {
            THEN("the value is correct") { REQUIRE(to_string(a) == "192.168.7.143"); }
        }

        WHEN("we insert it into an ostream")
        {
            std::ostringstream os;
            os << a;

            THEN("the value is correct") { REQUIRE(os.str() == "192.168.7.143"); }
        }

        WHEN("we compare it with the same, string-created, address")
        {
            const auto from_string = from_dotted_string("192.168.7.143");

            THEN("the value is correct") { REQUIRE(from_string == a); }
        }
    }

    GIVEN("an address as a dotted string")
    {
        const auto s = "192.168.7.143";

        WHEN("we convert it to an address")
        {
            THEN("the value is correct") { REQUIRE(from_dotted_string(s) == address(0x8f07a8c0)); }
        }
    }

    GIVEN("an invalid address")
    {
        const auto s = ".168.7.143";

        WHEN("we convert it to an address")
        {
            THEN("an exception is thrown") { REQUIRE_THROWS(from_dotted_string(s)); }
        }
    }
}

SCENARIO("IPv4 endpoints")
{
    GIVEN("an endpoint")
    {
        const auto e = endpoint{from_dotted_string("192.168.7.143"), to_net(uint16_t(12345))};

        WHEN("we convert it to string")
        {
            THEN("the value is correct") { REQUIRE("192.168.7.143:12345" == to_string(e)); }
        }

        WHEN("we compare it with another equal endpoint")
        {
            const auto another_e = endpoint{from_dotted_string("192.168.7.143"), to_net(uint16_t(12345))};
            THEN("the comparison is true") { REQUIRE(another_e == e); }
        }

        WHEN("we compare it with a different equal endpoint")
        {
            const auto another_e = endpoint{from_dotted_string("192.168.7.143"), to_net(uint16_t(45321))};
            THEN("the comparison is false") { REQUIRE(another_e != e); }
        }
    }
}
