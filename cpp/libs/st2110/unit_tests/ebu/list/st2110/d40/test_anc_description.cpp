
#include "catch2/catch.hpp"
#include "ebu/list/st2110/d40/anc_description.h"
#include "pch.h"

using namespace ebu_list;
using namespace ebu_list::media::anc;
using namespace ebu_list::st2110::d40;

//------------------------------------------------------------------------------
SCENARIO("default values for st2110-40")
{
    GIVEN("a newly created st2110-20 anc information")
    {
        const auto anc_info = anc_description{};

        WHEN("we check the default rate")
        {
            THEN("we get a value of {0/1}") { REQUIRE(anc_info.rate == video::Rate(0, 1)); }
        }

        WHEN("we check the number of packets per frame")
        {
            THEN("we get 0") { REQUIRE(anc_info.packets_per_frame == 0); }
        }

        WHEN("we check the number of substreams")
        {
            THEN("we get 0") { REQUIRE(anc_info.sub_streams.size() == 0); }
        }
    }
}

//------------------------------------------------------------------------------
SCENARIO("sdp creation for st2110 ancillary")
{
    GIVEN("a st2110-40 ancillary information")
    {
        const uint16_t did_sdid   = static_cast<uint16_t>(did_sdid::ANCILLARY_TIME_CODE);
        const uint16_t stream_num = 0;
        anc_sub_stream anc_stream(did_sdid, stream_num);

        auto anc_info = anc_description{};
        anc_info.rate = {50, 1};
        anc_info.sub_streams.push_back(anc_stream);

        st2110_40_sdp_serializer sdp_serializer{anc_info};
        media::network_media_description desc;
        desc.type                 = media::media_type::ANCILLARY_DATA;
        desc.network.payload_type = 100;
        desc.network.source       = ipv4::from_string("192.168.1.10", 5000);
        desc.network.destination  = ipv4::from_string("255.10.10.1", 5000);

        WHEN("we generate the additional attributes tag")
        {
            std::vector<std::string> lines;
            sdp_serializer.additional_attributes(lines, desc);

            THEN("we get the correct information")
            {
                const std::vector<std::string> expected = {"a=source-filter: incl IN IP4 255.10.10.1 192.168.1.10",
                                                           "a=fmtp:100 DID_SDID={0x60,0x60};"};

                REQUIRE(lines.size() == expected.size());
                REQUIRE(lines == expected);
            }
        }

        WHEN("we generate the rtpmap line")
        {
            std::vector<std::string> lines;
            sdp_serializer.write_rtpmap_line(lines, desc);

            THEN("we get the right values")
            {
                const std::vector<std::string> expected = {"a=rtpmap:100 smpte291/90000"};
                REQUIRE(lines == expected);
            }
        }
    }
}
