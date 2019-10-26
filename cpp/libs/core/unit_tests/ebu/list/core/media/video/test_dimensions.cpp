#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/media/video/dimensions.h"

using namespace ebu_list::media::video;

SCENARIO("video_dimensions is created")
{
    GIVEN("a 1920x1080 video dimension")
    {
        video_dimensions v = build_1920x1080();

        WHEN("we try to get the width")
        {
            const auto width = v.width;

            THEN("we get 1920") { REQUIRE(width == 1920); }
        }

        WHEN("we try to get the height")
        {
            const auto height = v.height;

            THEN("we get 1920") { REQUIRE(height == 1080); }
        }
    }

    GIVEN("a 1280x720 video dimension")
    {
        video_dimensions v = build_1280x720();

        WHEN("we try to get the width")
        {
            const auto width = v.width;

            THEN("we get 1280") { REQUIRE(width == 1280); }
        }

        WHEN("we try to get the height")
        {
            const auto height = v.height;

            THEN("we get 720") { REQUIRE(height == 720); }
        }
    }
}