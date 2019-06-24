#include "pch.h"
#include "ebu/list/st2110/d20/video_format_detector.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/test_lib/sample_files.h"
#include "ebu/list/pcap/player.h"
#include "rtp_source.h"
#include "utils.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::test;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

SCENARIO("ST2110-20 heuristics")
{
    GIVEN("a 1080i59.94 video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result == detector::status::valid);

            THEN("we get the correct format")
            {
                const auto details = detector.get_details();
                REQUIRE(std::holds_alternative<video_description>(details));
                const auto video_details = std::get<d20::video_description>(details);
                REQUIRE(video_details.packets_per_frame == 2160);
                REQUIRE(video_details.rate == video::Rate(60000, 1001));
                REQUIRE(video_details.scan_type == video::scan_type::INTERLACED);
                REQUIRE(video_details.dimensions.width == 1920);
                REQUIRE(video_details.dimensions.height == 1080);
                REQUIRE(video_details.sampling == video::video_sampling::YCbCr_4_2_2);
            }
        }
    }

    GIVEN("a 720p50 video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_720p50.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result == detector::status::valid);

            THEN("we get the correct format")
            {
                const auto details = detector.get_details();
                REQUIRE(std::holds_alternative<video_description>(details));
                const auto video_details = std::get<d20::video_description>(details);
                REQUIRE(video_details.packets_per_frame == 2160);
                REQUIRE(video_details.rate == video::Rate(50));
                REQUIRE(video_details.scan_type == video::scan_type::PROGRESSIVE);
                REQUIRE(video_details.dimensions.width == 1280);
                REQUIRE(video_details.dimensions.height == 720);
                REQUIRE(video_details.sampling == video::video_sampling::YCbCr_4_2_2);
            }
        }
    }

    GIVEN("a 625i50 video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_625i50.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result == detector::status::valid);

            THEN("we get the correct format")
            {
                const auto details = detector.get_details();
                REQUIRE(std::holds_alternative<video_description>(details));
                const auto video_details = std::get<d20::video_description>(details);
                REQUIRE(video_details.packets_per_frame == 384);
                REQUIRE(video_details.rate == video::Rate(50));
                REQUIRE(video_details.scan_type == video::scan_type::INTERLACED);
                REQUIRE(video_details.dimensions.width == 720);
                REQUIRE(video_details.dimensions.height == 576);
                REQUIRE(video_details.sampling == video::video_sampling::YCbCr_4_2_2);
            }
        }
    }

    GIVEN("a audio stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l16_48000_2ch_1ms.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid")
            {
                REQUIRE(result == detector::status::invalid);
            }
        }
    }

    GIVEN("a anc stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/2110-40_5994i.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid")
            {
                REQUIRE(result == detector::status::invalid);
            }
        }
    }
}
