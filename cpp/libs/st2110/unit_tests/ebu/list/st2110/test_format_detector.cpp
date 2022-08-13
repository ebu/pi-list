#include "catch2/catch.hpp"
#include "ebu/list/pcap/player.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/test_lib/sample_files.h"
#include "format_detector_handler.h"

using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d20;
using namespace ebu_list::st2110::d30;
using namespace ebu_list::st2110::d40;

//------------------------------------------------------------------------------

SCENARIO("format detector with media type specification")
{
    GIVEN("a st2110-22 video stream")
    {
        format_detector_handler* fd = nullptr;
        media::full_media_type media_type = ebu_list::media::full_media_type::JXSV;

        auto create_handler = [&](const udp::datagram&) {
            auto d = std::make_unique<format_detector_handler>(media_type);
            fd     = d.get();
            return d;
        };

        auto udp_handler = std::make_shared<rtp::udp_handler>(create_handler);

        const auto pcap_file   = test_lib::sample_file("pcap/st2110/2110-22/125mbps-JPEGXS.pcap");
        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "video/jxsv");
        }
    }
}
SCENARIO("format detector")
{
    format_detector_handler* fd = nullptr;

    auto create_handler = [&](const udp::datagram&) {
        auto d = std::make_unique<format_detector_handler>();
        fd     = d.get();
        return d;
    };

    auto udp_handler = std::make_shared<rtp::udp_handler>(create_handler);

    GIVEN("a st2110-22 video stream with no media type specified")
    {
        const auto pcap_file   = test_lib::sample_file("pcap/st2110/2110-22/125mbps-JPEGXS.pcap");
        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the state")
        {
            REQUIRE(fd->status().state == detector::state::invalid);
        }
    }

    GIVEN("a st2110-20 video stream")
    {
        const auto pcap_file   = test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");
        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "video/raw");

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

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            REQUIRE(fd->status().state == detector::state::valid);

            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            THEN("we get audio")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<audio_description>(details));
                const auto audio_details = std::get<audio_description>(details);
                REQUIRE(audio_details.sampling == media::audio::audio_sampling::_48kHz);
                REQUIRE(audio_details.packet_time == audio_packet_time(std::chrono::milliseconds(1)));
                REQUIRE(audio_details.number_channels == 2);
                REQUIRE(audio_details.encoding == media::audio::audio_encoding::L16);

                REQUIRE(full_media_type == "audio/L16");
            }
        }
    }

    GIVEN("a audio stream 2")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-30/l24_48000_8ch_0125.pcap");

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            REQUIRE(fd->status().state == detector::state::valid);

            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            THEN("we get audio")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<audio_description>(details));
                const auto audio_details = std::get<audio_description>(details);
                REQUIRE(audio_details.sampling == media::audio::audio_sampling::_48kHz);
                REQUIRE(audio_details.packet_time == audio_packet_time(std::chrono::microseconds(125)));
                REQUIRE(audio_details.number_channels == 8);
                REQUIRE(audio_details.encoding == media::audio::audio_encoding::L24);

                REQUIRE(full_media_type == "audio/L24");
            }
        }
    }

    GIVEN("a ancillary stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/2110-40_5994i.pcap");

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "video/smpte291");

            THEN("we get anc")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<anc_description>(details));
            }
        }
    }

    GIVEN("an ancillary stream with 3 valid types inside")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/anc_with_timecode+CC+AFD.pcap");
        /* Note that this pcap also contains SCTE-104 but not too late
         * to be captured by the format detector */

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "video/smpte291");

            THEN("it has 3 valid sub-streams @ 5 pkts/frame")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<anc_description>(details));
                const auto anc_details = std::get<anc_description>(details);
                REQUIRE(anc_details.packets_per_frame == 5);
                REQUIRE(anc_details.sub_streams.size() == 3);
            }
        }
    }

    GIVEN("a pcap file with 1 TTML stream with 1 packet per document")
    {
        const auto pcap_file = test_lib::sample_file("pcap/ttml/ttmlRTP_singlePacketDocs.pcap");

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "application/ttml+xml");

            THEN("we get ttml")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<ttml::description>(details));
            }
        }
    }

    GIVEN("a pcap file with 1 TTML stream with 4 packets per document")
    {
        const auto pcap_file = test_lib::sample_file("pcap/ttml/ttmlRTP_fourPacketDocs.pcap");

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "application/ttml+xml");

            THEN("we get ttml")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<ttml::description>(details));
            }
        }
    }

    GIVEN("a pcap file with a truncated document at the start")
    {
        const auto pcap_file = test_lib::sample_file("pcap/ttml/ttmlRTP_truncated_start.pcap");

        auto progress_callback = [](float) {};
        pcap::pcap_player player(pcap_file, progress_callback, udp_handler, on_error_exit);
        while(player.next())
        {
        }

        REQUIRE(fd != nullptr);

        WHEN("we check the format")
        {
            const auto maybe_full_media_type = fd->get_full_media_type();
            const auto full_media_type       = std::get<std::string>(maybe_full_media_type);

            REQUIRE(fd->status().state == detector::state::valid);
            REQUIRE(full_media_type == "application/ttml+xml");

            THEN("we get ttml")
            {
                const auto details = fd->get_details();
                REQUIRE(std::holds_alternative<ttml::description>(details));
            }
        }
    }
}
