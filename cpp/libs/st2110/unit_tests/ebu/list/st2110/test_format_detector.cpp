#include "pch.h"
#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/st2110/d20/video_format_detector.h"
#include "ebu/list/st2110/d30/audio_format_detector.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/test_lib/sample_files.h"
#include "ebu/list/pcap/player.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d30;

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

        pcap::pcap_player player(pcap_file, udp_handler, on_error_exit);
        while (player.next()) {}

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            REQUIRE(fd->status().state == detector::state::valid);

            THEN("we get video")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<video_description>(details));
                const auto video_details = std::get<video_description>(details);
                REQUIRE(video_details.packets_per_frame == 2160);
                REQUIRE(video_details.rate == video::Rate(60000, 1001));
            }
        }
    }

    GIVEN("a audio stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l16_48000_2ch_1ms.pcap");

        pcap::pcap_player player(pcap_file, udp_handler, on_error_exit);
        while (player.next()) {}

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            REQUIRE(fd->status().state == detector::state::valid);

            THEN("we get audio")
            {
                const auto details = fd->get_details();
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

        pcap::pcap_player player(pcap_file, udp_handler, on_error_exit);
        while (player.next()) {}

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            REQUIRE(fd->status().state == detector::state::valid);

            THEN("we get audio")
            {
                const auto details = fd->get_details();
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
