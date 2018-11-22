#include "pch.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::media::audio;
using namespace ebu_list::st2110::d30;
using namespace std::chrono_literals;

//------------------------------------------------------------------------------
SCENARIO("sdp creation for st2110 audio")
{
    GIVEN("a st2110-30 audio information")
    {
        auto audio_info = audio_description {};
        audio_info.encoding = audio_encoding::L24;
        audio_info.number_channels = 2;
        audio_info.sampling = audio_sampling::_48kHz;
        audio_info.packet_time = 1ms;

        st2110_30_sdp_serializer sdp_serializer {audio_info};
        media::network_media_description desc;
        desc.type = media::media_type::AUDIO;
        desc.network.payload_type = 96;
        desc.network.source = ipv4::from_string("192.168.1.10", 5000);
        desc.network.destination = ipv4::from_string("255.10.10.1", 5000);

        WHEN("we generate the additional attributes tag")
        {
            std::vector<std::string> lines;
            sdp_serializer.additional_attributes(lines, desc);

            THEN("we get the correct information")
            {
                const std::vector<std::string> expected = { "a=source-filter:incl IN IP4 255.10.10.1 192.168.1.10", "a=ptime:1" };
                REQUIRE( lines == expected );
            }
        }

        WHEN("we generate the additional attributes tag with a packet time less than 1ms")
        {
            audio_info.packet_time = 125us;
            std::vector<std::string> lines;
            sdp_serializer.additional_attributes(lines, desc);

            THEN("we get the correct information")
            {
                const std::vector<std::string> expected = { "a=source-filter:incl IN IP4 255.10.10.1 192.168.1.10", "a=ptime:0.125" };
                REQUIRE( lines == expected );
            }
        }

        WHEN("we generate the rtpmap line")
        {
            std::vector<std::string> lines;
            sdp_serializer.write_rtpmap_line(lines, desc);

            THEN("we get the correct information")
            {
                const std::vector<std::string> expected = { "a=rtpmap:96 L24/48000/2" };
                REQUIRE( lines == expected );
            }
        }
    }
}

