#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/types.h"

using namespace ebu_list;

//------------------------------------------------------------------------------
SCENARIO("to_date_time_string")
{
    GIVEN("a timepoint in ebu_list::clock")
    {
        WHEN("it is 0 ns after the epoch")
        {
            const auto t = ebu_list::clock::time_point();

            THEN("the representation should be correct")
            {
                REQUIRE(to_date_time_string(t) == "1970-01-01 00:00:00.000000000");
            }
        }

        WHEN("it is offset from the epoch")
        {
            const auto t = clock::time_point(clock::duration(1505922122000012345));

            THEN("the representation should be correct")
            {
                REQUIRE(to_date_time_string(t) == "2017-09-20 15:42:02.000012345");
            }
        }
    }
}

//------------------------------------------------------------------------------
