#include "pch.h"
#include "ebu/list/st2110/d20/video_description.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::media::video;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------
SCENARIO("default values for st2110-20")
{
    GIVEN("a newly created st2110-20 video information")
    {
        const auto video_info =  video_description{};

        WHEN("we check the default scan type")
        {
            THEN("we get a progressive scan")
            {
                REQUIRE( video_info.scan_type == video::scan_type::PROGRESSIVE);
            }
        }
    }
}

//------------------------------------------------------------------------------
SCENARIO("sdp creation for st2110 video")
{
    GIVEN("a st2110-20 video information")
    {
        auto video_info =  video_description{};
        video_info.sampling = video::video_sampling::YCbCr_4_2_2;
        video_info.color_depth = 10;
        video_info.dimensions = {1920, 1080};
        video_info.rate = {50, 1};
        video_info.colorimetry = video::colorimetry::BT601;

        st2110_20_sdp_serializer sdp_serializer {video_info};
        media::network_media_description desc;
        desc.type = media::media_type::VIDEO;
        desc.network.payload_type = 96;
        desc.network.source = ipv4::from_string("192.168.1.10", 5000);
        desc.network.destination = ipv4::from_string("255.10.10.1", 5000);

        WHEN("we generate the additional attributes tag")
        {
            std::vector<std::string> lines;
            sdp_serializer.additional_attributes(lines, desc);

            THEN("we get the correct information")
            {
                const std::vector<std::string> expected = { "a=source-filter:incl IN IP4 255.10.10.1 192.168.1.10",
                    "a=fmtp:96 sampling=YCbCr-4:2:2; width=1920; height=1080; exactframerate=50; depth=10; colorimetry=BT601; PM=2110GPM; SSN=ST2110-20:2017;" };

                REQUIRE( lines.size() == expected.size() );
                REQUIRE( lines == expected );
            }
        }

        WHEN("we generate the additional attributes tag with a not integer framerate")
        {
            video_info.rate = Rate(60,1001);
            std::vector<std::string> lines;
            sdp_serializer.additional_attributes(lines, desc);

            THEN("we get the correct information")
            {
                const std::vector<std::string> expected = { "a=source-filter:incl IN IP4 255.10.10.1 192.168.1.10",
                    "a=fmtp:96 sampling=YCbCr-4:2:2; width=1920; height=1080; exactframerate=60/1001; depth=10; colorimetry=BT601; PM=2110GPM; SSN=ST2110-20:2017;" };

                REQUIRE( lines.size() == expected.size() );
                REQUIRE( lines == expected );
            }
        }

        WHEN("we generate the rtpmap line")
        {
            std::vector<std::string> lines;
            sdp_serializer.write_rtpmap_line(lines, desc);

            THEN("we get the right values")
            {
                const std::vector<std::string> expected = {"a=rtpmap:96 raw/90000"};
                REQUIRE( lines == expected );
            }
        }
    }
}
