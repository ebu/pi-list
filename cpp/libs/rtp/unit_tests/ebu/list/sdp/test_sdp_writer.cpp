#include "catch2/catch.hpp"
#include "ebu/list/sdp/sdp_builder.h"

using namespace ebu_list;
using namespace ebu_list::sdp;

SCENARIO("SDP serialization")
{
    sdp_global_settings settings{"session name", "session information"};

    media::network_info network_info{ethernet::to_mac_address("00:00:00:00:00:00").value(),
                                     ethernet::to_mac_address("00:00:00:00:00:00").value(),
                                     ipv4::from_string("192.168.1.1", 52652),
                                     ipv4::from_string("234.0.0.1", 5000),
                                     96,
                                     0};

    GIVEN("basic information about a SDP session")
    {
        WHEN("we try to serialize it into SDP format")
        {
            const auto sdp    = sdp_builder(settings);
            const auto& lines = sdp.sdp();

            THEN("it has, at least, 6 lines") { REQUIRE(lines.size() >= 6); }

            THEN("the first line has the version")
            {
                const auto version_line = lines[0];
                REQUIRE(version_line == "v=0");
            }

            THEN("the second line has the origin")
            {
                const auto origin_line = lines[1];
                REQUIRE(origin_line[0] == 'o');
                // TODO: add checks when we fill the origin information
            }

            THEN("the third line has the session name")
            {
                const auto session_line = lines[2];
                REQUIRE(session_line == "s=session name");
            }

            THEN("we have an information line")
            {
                const auto info_line = lines[3];
                REQUIRE(info_line.rfind("i=session information") == 0);
            }

            THEN("we have timming information")
            {
                const auto time_line = lines[4];
                REQUIRE(time_line[0] == 't');
                // TODO: add checks when we fill the timming information
            }
        }
    }

    GIVEN("a generic video stream")
    {
        media::network_media_description media{network_info, media::media_type::VIDEO, media::full_media_type::RAW};

        WHEN("we try to serialize it into SDP format")
        {
            auto sdp          = sdp_builder(settings);
            auto initial_size = sdp.sdp().size();
            const auto lines  = sdp.add_media(media).sdp();

            THEN("4 lines were added") { REQUIRE(lines.size() - initial_size == 4); }

            THEN("the first added line is a media line")
            {
                const auto line = lines[initial_size];
                REQUIRE(line == "m=video 5000 RTP/AVP 96");
            }

            THEN("the second line is a connection line")
            {
                const auto line = lines[initial_size + 1];
                REQUIRE(line == "c=IN IP4 234.0.0.1/32");
            }

            THEN("the third and fourth lines identify the reference clock")
            {
                const auto line3 = lines[initial_size + 2];
                const auto line4 = lines[initial_size + 3];
                REQUIRE(line3 == "a=mediaclk:direct=0");
                REQUIRE(line4 == "a=ts-refclk:ptp=IEEE1588-2008:00-00-00-00-00-00-00-00:0");
            }
        }
    }

    GIVEN("a generic anc stream")
    {
        media::network_media_description media{network_info, media::media_type::ANCILLARY_DATA, media::full_media_type::SMPTE291};

        WHEN("we try to serialize it into SDP format")
        {
            auto sdp          = sdp_builder(settings);
            auto initial_size = sdp.sdp().size();
            const auto lines  = sdp.add_media(media).sdp();

            THEN("4 lines were added") { REQUIRE(lines.size() - initial_size == 4); }

            THEN("the first added line is a media line")
            {
                const auto line = lines[initial_size];
                REQUIRE(line == "m=video 5000 RTP/AVP 96");
            }

            THEN("the second line is a connection line")
            {
                const auto line = lines[initial_size + 1];
                REQUIRE(line == "c=IN IP4 234.0.0.1/32");
            }

            THEN("the third and fourth lines identify the reference clock")
            {
                const auto line3 = lines[initial_size + 2];
                const auto line4 = lines[initial_size + 3];
                REQUIRE(line3 == "a=mediaclk:direct=0");
                REQUIRE(line4 == "a=ts-refclk:ptp=IEEE1588-2008:00-00-00-00-00-00-00-00:0");
            }
        }
    }
    GIVEN("an unknown stream")
    {
        auto sdp = sdp_builder(settings);
        media::network_media_description unknown{network_info, media::media_type::UNKNOWN, media::full_media_type::UNKNOWN};

        WHEN("we try to serialize it into SDP format")
        {
            THEN("we get an error") { REQUIRE_THROWS_AS(sdp.add_media(unknown), std::invalid_argument); }
        }
    }
}
