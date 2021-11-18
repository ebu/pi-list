#include "catch2/catch.hpp"
#include "ebu/list/st2110/d22/video_format_detector.h"
#include "ebu/list/test_lib/sample_files.h"
#include "rtp_source.h"
#include "utils.h"

using namespace ebu_list;
using namespace ebu_list::test;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d22;

//------------------------------------------------------------------------------

SCENARIO("ST2110-22 heuristics")
{
    GIVEN("a 125mbps JPEG XS video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-22/125mbps-JPEGXS.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is valid") { REQUIRE(result.state == detector::state::valid); }
        }
    }

    GIVEN("a 250mbps JPEG XS video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-22/250mbps-JPEGXS.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is valid") { REQUIRE(result.state == detector::state::valid); }
        }
    }

    GIVEN("a 500mbps JPEG XS video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-22/500mbps-JPEGXS.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is valid") { REQUIRE(result.state == detector::state::valid); }
        }
    }

    GIVEN("a video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }

    GIVEN("an audio stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l16_48000_2ch_1ms.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }

    GIVEN("an ancillary stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/2110-40_5994i.pcap");
        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }

    GIVEN("a valid ancillary stream with no data inside")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/empty_data_but_valid.pcap");

        rtp_source source(pcap_file);

        video_format_detector detector;
        const auto result = test::run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }
}
