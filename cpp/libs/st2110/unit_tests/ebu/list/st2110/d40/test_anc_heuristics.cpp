#include "catch.hpp"
#include "ebu/list/pcap/player.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/test_lib/sample_files.h"
#include "pch.h"
#include "rtp_source.h"
#include "utils.h"

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
            REQUIRE(result.state == detector::state::valid);

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
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }

    GIVEN("a audio stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l16_48000_2ch_1ms.pcap");

        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }

    GIVEN("an ancillary stream with unknown DID/SDID")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/forged_as_invalid_did-sdid=1.pcap");

        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::invalid); }
        }
    }

    GIVEN("a valid ancillary stream with no data inside")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/empty_data_but_valid.pcap");

        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is invalid") { REQUIRE(result.state == detector::state::valid); }
        }
    }

    GIVEN("an ancillary stream with 4 valid types inside")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/anc_with_timecode+CC+AFD.pcap");

        rtp_source source(pcap_file);

        anc_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result.state == detector::state::valid);
            THEN("it is invalid")
            {
                const auto details     = detector.get_details();
                const auto anc_details = std::get<d40::anc_description>(details);
                REQUIRE(anc_details.packets_per_frame == 5);
                REQUIRE(anc_details.sub_streams.size() == 3);
            }
        }
    }
}
