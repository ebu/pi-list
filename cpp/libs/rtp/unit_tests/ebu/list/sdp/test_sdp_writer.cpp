#include "pch.h"

#include "ebu/list/sdp/sdp_writer.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::sdp;

SCENARIO("SDP serialization")
{
    sdp_global_settings settings{"session name", "session information", "/tmp/folder/sdp.sdp"};

    media::network_info network_info {
            ipv4::from_string("192.168.1.1", 52652),
            ipv4::from_string("234.0.0.1", 5000),
            96,
            0
    };

    GIVEN("basic information about a SDP session")
    {
        WHEN("we try to serialize it into SDP format")
        {
            const auto sdp = sdp_writer(settings);
            const auto lines = sdp.sdp();

            THEN("it has, at least, 6 lines")
            {
                REQUIRE( lines.size() >= 6 );
            }

            THEN("the first line has the version")
            {
                const auto version_line = lines[0];
                REQUIRE( version_line == "v=0" );
            }

            THEN("the second line has the origin")
            {
                const auto origin_line = lines[1];
                REQUIRE( origin_line[0] == 'o' );
                //TODO: add checks when we fill the origin information
            }

            THEN("the third line has the session name")
            {
                const auto session_line = lines[2];
                REQUIRE( session_line == "s=session name" );
            }

            THEN("we have an information line")
            {
                const auto info_line = lines[3];
                REQUIRE( info_line.rfind("i=session information") == 0);
            }

            THEN("we have timming information")
            {
                const auto time_line = lines[4];
                REQUIRE( time_line[0] == 't' );
                //TODO: add checks when we fill the timming information
            }
        }
    }

    GIVEN("a generic video stream")
    {
        media::network_media_description media { network_info, media::media_type::VIDEO };

        WHEN("we try to serialize it into SDP format")
        {
            auto sdp = sdp_writer(settings);
            auto initial_size = sdp.sdp().size();
            const auto lines = sdp.add_media(media).sdp();

            THEN("4 lines were added")
            {
                REQUIRE( lines.size() - initial_size == 4 );
            }

            THEN("the first added line is a media line")
            {
                const auto line = lines[initial_size];
                REQUIRE( line == "m=video 5000 RTP/AVP 96" );
            }

            THEN("the second line is a connection line")
            {
                const auto line = lines[initial_size + 1];
                REQUIRE( line == "c=IN IP4 234.0.0.1/32" );
            }
        }
    }

    GIVEN("an unknown stream")
    {
        auto sdp = sdp_writer(settings);
        media::network_media_description unknown { network_info, media::media_type::UNKNOWN };

        WHEN("we try to serialize it into SDP format")
        {
            THEN("we get an error")
            {
                REQUIRE_THROWS_AS(sdp.add_media(unknown), std::invalid_argument);
            }
        }
    }
}
