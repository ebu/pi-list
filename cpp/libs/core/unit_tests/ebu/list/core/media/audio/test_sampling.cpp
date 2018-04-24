#include "pch.h"

#include "ebu/list/core/media/audio/sampling.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::media::audio;

SCENARIO("audio_sampling")
{
    GIVEN("a valid audio sampling")
    {
        const auto _48k = audio_sampling::_48kHz;
        const auto _44k = audio_sampling::_44_1kHz;
        const auto _96k = audio_sampling::_96kHz;

        WHEN("we convert it to a string representation")
        {
            THEN("we get the right representation")
            {
                REQUIRE( to_string(_48k) == "48000" );
                REQUIRE( to_string(_44k) == "44100" );
                REQUIRE( to_string(_96k) == "96000" );
            }
        }

        WHEN("we convert it to a integer representation")
        {
            THEN("we get the right representation")
            {
                REQUIRE( to_int(_48k) == 48000 );
                REQUIRE( to_int(_44k) == 44100 );
                REQUIRE( to_int(_96k) == 96000 );
            }
        }
    }

    GIVEN("string representations of audio sampling")
    {
        WHEN("we try to convert them to audio_sampling abstraction")
        {
            THEN("we get the right conversion")
            {
                REQUIRE( parse_audio_sampling("48000") == audio_sampling::_48kHz );
                REQUIRE( parse_audio_sampling("44100") == audio_sampling::_44_1kHz );
                REQUIRE( parse_audio_sampling("96000") == audio_sampling::_96kHz );
            }

            THEN("an unknown sampling is converted as unknown")
            {
                REQUIRE( parse_audio_sampling("44000") == audio_sampling::UNKNOWN );
                REQUIRE( parse_audio_sampling("46000") == audio_sampling::UNKNOWN );
                REQUIRE( parse_audio_sampling("48") == audio_sampling::UNKNOWN );
            }
        }
    }

    GIVEN("an unknown audio sampling")
    {
        const auto unknown = parse_audio_sampling("46000");

        WHEN("we convert them to int")
        {
            THEN("it throws")
            {
                REQUIRE_THROWS_AS( to_int(unknown), std::invalid_argument );

            }
        }

        WHEN("we convert them to string")
        {
            THEN("it throws")
            {
                REQUIRE_THROWS_AS( to_string(unknown), std::invalid_argument );
            }
        }
    }
}

SCENARIO("audio_encoding")
{
    GIVEN("a valid audio sampling")
    {
        const auto l16 = audio_encoding::L16;
        const auto l24 = audio_encoding::L24;

        WHEN("we convert it to a string representation")
        {
            THEN("we get the right representation")
            {
                REQUIRE( to_string(l16) == "L16" );
                REQUIRE( to_string(l24) == "L24" );
            }
        }

        WHEN("we get the number of bits")
        {
            THEN("we get the right values")
            {
                REQUIRE( 16 == number_of_bits(l16) );
                REQUIRE( 24 == number_of_bits(l24) );
            }
        }
    }

    GIVEN("a string representation")
    {
        WHEN("we convert a valid representation")
        {
            THEN("we get the right value")
            {
                REQUIRE( audio_encoding::L16 == parse_audio_encoding("L16") );
                REQUIRE( audio_encoding::L24 == parse_audio_encoding("L24") );
            }
        }

        WHEN("we convert an invalid representation")
        {
            THEN("we get an unknown value")
            {
                REQUIRE( audio_encoding::UNKNOWN == parse_audio_encoding("L26") );
                REQUIRE( audio_encoding::UNKNOWN == parse_audio_encoding("L14") );
            }
        }

    }

    GIVEN("an invalid audio sampling")
    {
        const auto invalid = parse_audio_encoding("L26");

        WHEN("we try to convert it to string")
        {
            THEN("we get an 'unknown' string'")
            {
                REQUIRE( "unknown" == to_string(invalid) );
            }

        }

        WHEN("we try to get the bits per sample")
        {
            THEN("it throws")
            {
                REQUIRE_THROWS_AS( number_of_bits(invalid), std::invalid_argument );
            }
        }
    }
}
