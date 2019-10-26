#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/media/video_description.h"

using namespace ebu_list::media::video;

constexpr const char* progressive_s = "progressive";
constexpr const char* interlaced_s  = "interlaced";

SCENARIO("reading scan type from a string")
{
    GIVEN("a string that represents a scan type")
    {
        WHEN("we convert it to a scan type")
        {
            THEN("we get the right enum value")
            {
                REQUIRE(scan_type::PROGRESSIVE == parse_scan_type(progressive_s));
                REQUIRE(scan_type::INTERLACED == parse_scan_type(interlaced_s));
            }
        }
    }
}

//-------------------------------------------------------------------------

SCENARIO("converting scan type to a string")
{
    GIVEN("a scan type")
    {
        WHEN("we convert it to a string")
        {
            THEN("we get the right enum value")
            {
                REQUIRE(progressive_s == to_string(scan_type::PROGRESSIVE));
                REQUIRE(interlaced_s == to_string(scan_type::INTERLACED));
            }
        }
    }
}

//-------------------------------------------------------------------------

SCENARIO("parsing rate from a string")
{
    GIVEN("a string which represents a video rate")
    {
        WHEN("we convert it a rate representation")
        {
            THEN("we get the right value")
            {
                REQUIRE(Rate(24, 1) == parse_from_string("24"));
                REQUIRE(Rate(25, 1) == parse_from_string("25"));
                REQUIRE(Rate(30000, 1001) == parse_from_string("30000/1001"));
                REQUIRE(Rate(30, 1) == parse_from_string("30"));
                REQUIRE(Rate(50, 1) == parse_from_string("50"));
                REQUIRE(Rate(60000, 1001) == parse_from_string("60000/1001"));
                REQUIRE(Rate(60, 1) == parse_from_string("60"));
            }
        }
    }

    GIVEN("a string which does not represent a preset video rate")
    {
        const auto not_valid = "26";

        WHEN("we try to convert it to a rate representation")
        {
            THEN("it returns 0") // TODO: this should signal an error
            {
                REQUIRE(Rate(0) == parse_from_string(not_valid));
            }
        }
    }
}