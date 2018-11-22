#include "pch.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/test_lib/sample_files.h"
#include "ebu/list/pcap/player.h"
#include "rtp_source.h"
#include "utils.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::test;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d40;

//------------------------------------------------------------------------------

SCENARIO("ST2110-40 heuristics")
{
    GIVEN("a anc stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/2110-40_5994i.pcap");
        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result == detector::status::valid);

            THEN("we get the correct format")
            {
                const auto details = detector.get_details();
                REQUIRE(std::holds_alternative<anc_description>(details));
            }
        }
    }

    GIVEN("a video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");
        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid")
            {
                REQUIRE(result == detector::status::invalid);
            }
        }
    }

    GIVEN("a audio stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/st2110-30_16bit_48khz_125us_2ch.pcap");

        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid")
            {
                REQUIRE(result == detector::status::invalid);
            }
        }
    }
}
