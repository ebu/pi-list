#include "pch.h"
#include "ebu/list/st2110/d30/audio_format_detector.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/test_lib/sample_files.h"
#include "ebu/list/pcap/player.h"
#include "rtp_source.h"
#include "utils.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::test;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d30;

//------------------------------------------------------------------------------

SCENARIO("ST2110-30 heuristics")
{
    GIVEN("a video stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");
        rtp_source source(pcap_file);

        audio_format_detector detector;
        const auto result = test::run_detector(detector, source);

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

        audio_format_detector detector;
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
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l16_48000_2ch_1ms.pcap");
        rtp_source source(pcap_file);

        audio_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result == detector::status::valid);

            THEN("we get the correct format")
            {
                const auto details = detector.get_details();
                REQUIRE(std::holds_alternative<audio_description>(details));
                const auto audio_details = std::get<audio_description>(details);
                REQUIRE(audio_details.sampling == media::audio::audio_sampling::_48kHz);
                REQUIRE(audio_details.packet_time == audio_packet_time(std::chrono::milliseconds(1)));
                REQUIRE(audio_details.number_channels == 2);
                REQUIRE(audio_details.encoding == media::audio::audio_encoding::L16);
            }
        }
    }

    GIVEN("a audio stream 2")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l24_48000_8ch_0125.pcap");
        rtp_source source(pcap_file);

        audio_format_detector detector;
        const auto result = run_detector(detector, source);

        WHEN("we check the format")
        {
            REQUIRE(result == detector::status::valid);

            THEN("we get the correct format")
            {
                const auto details = detector.get_details();
                REQUIRE(std::holds_alternative<audio_description>(details));
                const auto audio_details = std::get<audio_description>(details);
                REQUIRE(audio_details.sampling == media::audio::audio_sampling::_48kHz);
                REQUIRE(audio_details.packet_time == audio_packet_time(std::chrono::microseconds(125)));
                REQUIRE(audio_details.number_channels == 8);
                REQUIRE(audio_details.encoding == media::audio::audio_encoding::L24);
            }
        }
    }
}


SCENARIO("ST2110-30 number of channels detection")
{
    REQUIRE(calculate_number_of_channels_and_depth(2, 1) == std::tuple(1, 16));
    REQUIRE(calculate_number_of_channels_and_depth(3, 1) == std::tuple(1, 24));
    REQUIRE(calculate_number_of_channels_and_depth(4, 1) == std::tuple(2, 16));
    REQUIRE(calculate_number_of_channels_and_depth(6, 1) == std::tuple(2, 24));
    REQUIRE(calculate_number_of_channels_and_depth(8, 1) == std::tuple(4, 16));
    REQUIRE(calculate_number_of_channels_and_depth(9, 1) == std::tuple(3, 24));
    REQUIRE(calculate_number_of_channels_and_depth(10, 1) == std::tuple(5, 16));
    REQUIRE(calculate_number_of_channels_and_depth(12, 1) == std::tuple(4, 24));
    REQUIRE(calculate_number_of_channels_and_depth(14, 1) == std::tuple(7, 16));
    REQUIRE(calculate_number_of_channels_and_depth(15, 1) == std::tuple(5, 24));
    REQUIRE(calculate_number_of_channels_and_depth(16, 1) == std::tuple(8, 16));
    REQUIRE(calculate_number_of_channels_and_depth(18, 1) == std::tuple(6, 24));
    REQUIRE(calculate_number_of_channels_and_depth(20, 1) == std::tuple(10, 16));
    REQUIRE(calculate_number_of_channels_and_depth(21, 1) == std::tuple(7, 24));
    REQUIRE(calculate_number_of_channels_and_depth(24, 1) == std::tuple(8, 24));
    REQUIRE(calculate_number_of_channels_and_depth(28, 1) == std::tuple(14, 16));
    REQUIRE(calculate_number_of_channels_and_depth(30, 1) == std::tuple(10, 24));
    REQUIRE(calculate_number_of_channels_and_depth(32, 1) == std::tuple(16, 16));
    REQUIRE(calculate_number_of_channels_and_depth(36, 1) == std::tuple(12, 24));
    REQUIRE(calculate_number_of_channels_and_depth(42, 1) == std::tuple(14, 24));
    REQUIRE(calculate_number_of_channels_and_depth(48, 1) == std::tuple(16, 24));
    REQUIRE(calculate_number_of_channels_and_depth(96, 1) == std::tuple(32, 24));
    REQUIRE(calculate_number_of_channels_and_depth(128, 1) == std::tuple(64, 16));
    REQUIRE(calculate_number_of_channels_and_depth(192, 1) == std::tuple(64, 24));

    REQUIRE(calculate_number_of_channels_and_depth(288, 48) == std::tuple(2, 24));
}
