#include "pch.h"
#include "ebu/list/st2110/d20/video_format_detector.h"
#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/test_lib/sample_files.h"
#include "ebu/list/pcap/player.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

SCENARIO("format detector")
{
    format_detector* fd = nullptr;

    auto create_handler = [&](rtp::packet first_packet)
    {
        auto d = std::make_unique<format_detector>(first_packet);
        fd = d.get();
        return d;
    };

    auto udp_handler = std::make_shared<rtp::udp_handler>(create_handler);

    GIVEN("a video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");

        pcap::pcap_player player(pcap_file, udp_handler);
        while (player.next()) {}

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            REQUIRE(fd->status() == detector::status::valid);

            THEN("we get video")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<video_description>(details));
                const auto video_details = std::get<d20::video_description>(details);
                REQUIRE(video_details.packets_per_frame == 2160);
                REQUIRE(video_details.rate == video::Rate(60000, 1001));
            }
        }
    }
}
