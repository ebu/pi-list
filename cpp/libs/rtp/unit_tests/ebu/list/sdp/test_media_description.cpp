#include "catch2/catch.hpp"
#include "ebu/list/sdp/media_description.h"

using namespace ebu_list::media;

constexpr const char* video_string = "video";
constexpr const char* audio_string = "audio";

SCENARIO("media_type is created")
{
    GIVEN("a string that might represent a media type")
    {
        WHEN("we parse it to a media_type")
        {
            THEN("we get the video enum value")
            {
                REQUIRE(media_type::VIDEO == from_string(video_string));
                REQUIRE(media_type::AUDIO == from_string(audio_string));
            }
        }
    }

    GIVEN("unknown string")
    {
        const auto s = "aabbbcc";

        WHEN("we parse it to a media_type")
        {
            auto value = from_string(s);

            THEN("we get the audio enum value")
            {
                REQUIRE(media_type::UNKNOWN == value);
            }
        }
    }
}

//----------------------------------------------------------
SCENARIO("media_type converted to string")
{
    GIVEN("a value that represents a media type")
    {
        WHEN("we convert it to a string")
        {
            THEN("we get the right string representation")
            {
                REQUIRE(video_string == to_string(media_type::VIDEO));
                REQUIRE(audio_string == to_string(media_type::AUDIO));
                REQUIRE("unknown" == to_string(media_type::UNKNOWN));
            }
        }
    }
}

SCENARIO("network media description is created")
{
    GIVEN("a newly created network media description")
    {
        const auto desc = network_media_description{};

        WHEN("we check its media_type")
        {
            THEN("we get it as unknown")
            {
                REQUIRE(desc.type == media_type::UNKNOWN);
            }
        }
    }
}
