#include "catch2/catch.hpp"
#include "ebu/list/core/media/video/sampling.h"

using namespace ebu_list;
using namespace ebu_list::media::video;

SCENARIO("Samples per pixel for video sampling")
{
    GIVEN("A video_sampling representation")
    {
        WHEN("we get the number of samples per pixel")
        {
            THEN("we get the right value")
            {
                REQUIRE(samples_per_pixel(video_sampling::YCbCr_4_2_0) == 1.5);
                REQUIRE(samples_per_pixel(video_sampling::YCbCr_4_2_2) == 2);
                REQUIRE(samples_per_pixel(video_sampling::YCbCr_4_4_4) == 3);
                REQUIRE(samples_per_pixel(video_sampling::RGB_4_4_4) == 3);
                REQUIRE(samples_per_pixel(video_sampling::XYZ_4_4_4) == 3);
            }
        }

        WHEN("we provide an uknown sampling")
        {
            THEN("it throws") { REQUIRE_THROWS_AS(samples_per_pixel(video_sampling::UNKNOWN), std::runtime_error); }
        }
    }
}
