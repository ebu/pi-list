#include "pch.h"

#include "ebu/list/st2110/d10/network.h"
#include "catch.hpp"

using namespace ebu_list::st2110::d10;

//------------------------------------------------------------------------------
SCENARIO("default values for st2110-10")
{
    GIVEN("a newly created st2110-10 stream information")
    {
        const auto stream_info =  stream_information{};

        WHEN("we check the default UDP max packet size")
        {
            THEN("we get Standard Size")
            {
                REQUIRE( stream_info.max_udp == STANDARD_UDP_SIZE_LIMIT );
            }
        }
    }
}