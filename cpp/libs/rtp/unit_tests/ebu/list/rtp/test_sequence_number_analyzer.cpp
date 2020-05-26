#include "pch.h"

#include "catch2/catch.hpp"
#include "ebu/list/rtp/sequence_number_analyzer.h"
using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

SCENARIO("Sequence number analyser")
{
    GIVEN("an empty sequence")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        WHEN("we check the dropped count")
        {
            THEN("it is 0") { REQUIRE(analyzer.num_dropped_packets() == 0); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has none") { REQUIRE(analyzer.dropped_packets().size() == 0); }
        }
    }

    GIVEN("a continuous sequence")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp{};

        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(3, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 0") { REQUIRE(analyzer.num_dropped_packets() == 0); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has none") { REQUIRE(analyzer.dropped_packets().size() == 0); }
        }
    }

    GIVEN("a continuous sequence with a repeated packet")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp{};

        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(3, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 0") { REQUIRE(analyzer.num_dropped_packets() == 0); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has none") { REQUIRE(analyzer.dropped_packets().size() == 0); }
        }
    }

    GIVEN("a continuous sequence which crosses the 16-bit numeric limits")
    {
        sequence_number_analyzer<uint16_t> analyzer;
        const clock::time_point ignore_timestamp{};

        analyzer.handle_packet(UINT16_MAX - 4, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 3, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 2, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 1, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX, ignore_timestamp);
        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(3, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 0") { REQUIRE(analyzer.num_dropped_packets() == 0); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has none") { REQUIRE(analyzer.dropped_packets().size() == 0); }
        }
    }

    GIVEN("a continuous sequence which crosses the 32-bit numeric limits")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp{};

        analyzer.handle_packet(UINT32_MAX - 4, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 3, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 2, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 1, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX, ignore_timestamp);
        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(3, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 0") { REQUIRE(analyzer.num_dropped_packets() == 0); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has none") { REQUIRE(analyzer.dropped_packets().size() == 0); }
        }
    }

    GIVEN("a sequence with a single missed packet")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(3, ts);

        WHEN("we check the dropped count")
        {
            THEN("it is 1") { REQUIRE(analyzer.num_dropped_packets() == 1); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #1") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == 1); }
            THEN("newest packet has sequence number #3") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == 3); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence with 5 missed packets")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(7, ts);

        WHEN("we check the dropped count")
        {
            THEN("it is 5") { REQUIRE(analyzer.num_dropped_packets() == 5); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #1") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == 1); }
            THEN("newest packet has sequence number #7") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == 7); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence with 5 missed packets before the numeric limit")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(UINT32_MAX - 6, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX, ts);
        analyzer.handle_packet(0, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 5") { REQUIRE(analyzer.num_dropped_packets() == 5); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #UINT32_MAX - 6") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == UINT32_MAX - 6); }
            THEN("newest packet has sequence number #UINT32_MAX") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == UINT32_MAX); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence with a single missed packet at the numeric limit")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(UINT32_MAX - 4, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 3, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 2, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 1, ignore_timestamp);
        analyzer.handle_packet(0, ts);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(3, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 1") { REQUIRE(analyzer.num_dropped_packets() == 1); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #UINT32_MAX - 1") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == UINT32_MAX - 1); }
            THEN("newest packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == 0); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence with 5 missed packets around the numeric limit")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts1 = clock::now();
        const clock::time_point ts2 = clock::now();
        const clock::time_point ts3 = clock::now();

        analyzer.handle_packet(UINT32_MAX - 4, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX - 1, ts1);
        analyzer.handle_packet(0, ts2);
        analyzer.handle_packet(3, ts3);

        WHEN("we check the dropped count")
        {
            THEN("it is 5") { REQUIRE(analyzer.num_dropped_packets() == 5); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has three") { REQUIRE(analyzer.dropped_packets().size() == 3); }
            THEN("first gap's last packet has sequence number #UINT32_MAX - 4") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == UINT32_MAX - 4); }
            THEN("first gap's newest packet has sequence number #UINT32_MAX - 1") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == UINT32_MAX - 1); }
            THEN("first gap's newest packet timestamp is ts1") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts1); }
            THEN("second gap's last packet has sequence number #UINT32_MAX - 1") { REQUIRE(analyzer.dropped_packets()[1].last_sequence_number == UINT32_MAX - 1); }
            THEN("second gap's newest packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[1].first_sequence_number == 0); }
            THEN("second gap's newest packet timestamp is ts2") { REQUIRE(analyzer.dropped_packets()[1].first_packet_timestamp == ts2); }
            THEN("third gap's last packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[2].last_sequence_number == 0); }
            THEN("third gap's newest packet has sequence number #3") { REQUIRE(analyzer.dropped_packets()[2].first_sequence_number == 3); }
            THEN("third gap's newest packet timestamp is ts3") { REQUIRE(analyzer.dropped_packets()[2].first_packet_timestamp == ts3); }
        }
    }

    GIVEN("a sequence with a single missed packet at the 16-bit numeric limit")
    {
        sequence_number_analyzer<uint16_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(UINT16_MAX - 4, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 3, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 2, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 1, ignore_timestamp);
        analyzer.handle_packet(0, ts);
        analyzer.handle_packet(1, ignore_timestamp);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(3, ignore_timestamp);

        WHEN("we check the dropped count")
        {
            THEN("it is 1") { REQUIRE(analyzer.num_dropped_packets() == 1); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #UINT16_MAX - 1") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == UINT16_MAX - 1); }
            THEN("newest packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == 0); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence with a 5 missed packets around the 16-bit numeric limit")
    {
        sequence_number_analyzer<uint16_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts1 = clock::now();
        const clock::time_point ts2 = clock::now();
        const clock::time_point ts3 = clock::now();

        analyzer.handle_packet(UINT16_MAX - 4, ignore_timestamp);
        analyzer.handle_packet(UINT16_MAX - 1, ts1);
        analyzer.handle_packet(0, ts2);
        analyzer.handle_packet(3, ts3);

        WHEN("we check the dropped count")
        {
            THEN("it is 5") { REQUIRE(analyzer.num_dropped_packets() == 5); }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has three") { REQUIRE(analyzer.dropped_packets().size() == 3); }
            THEN("first gap's last packet has sequence number #UINT16_MAX - 4") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == UINT16_MAX - 4); }
            THEN("first gap's newest packet has sequence number #UINT16_MAX - 1") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == UINT16_MAX - 1); }
            THEN("first gap's newest packet timestamp is ts1") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts1); }
            THEN("second gap's last packet has sequence number #UINT16_MAX - 1") { REQUIRE(analyzer.dropped_packets()[1].last_sequence_number == UINT16_MAX - 1); }
            THEN("second gap's newest packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[1].first_sequence_number == 0); }
            THEN("second gap's newest packet timestamp is ts2") { REQUIRE(analyzer.dropped_packets()[1].first_packet_timestamp == ts2); }
            THEN("third gap's last packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[2].last_sequence_number == 0); }
            THEN("third gap's newest packet has sequence number #3") { REQUIRE(analyzer.dropped_packets()[2].first_sequence_number == 3); }
            THEN("third gap's newest packet timestamp is ts3") { REQUIRE(analyzer.dropped_packets()[2].first_packet_timestamp == ts3); }
        }
    }

    GIVEN("a sequence that drops all packets except for the one "
          "at the lower and upper numeric limits")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(0, ignore_timestamp);
        analyzer.handle_packet(UINT32_MAX, ts);

        WHEN("we check the dropped count")
        {
            THEN("it is " + std::to_string(UINT32_MAX + 1 - 2))
            {
                // + 1 because the 0-th packet is the 1st one.
                REQUIRE(analyzer.num_dropped_packets() == UINT32_MAX - 2 + 1);
            }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #0") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == 0); }
            THEN("newest packet has sequence number #UINT32_MAX") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == UINT32_MAX); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence that drops all packets between index 2 and the next index 1")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts = clock::now();

        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(1, ts);

        WHEN("we check the dropped count")
        {
            THEN("it is " + std::to_string(int64_t(UINT32_MAX) - 2 + 1))
            {
                // + 1 because the 0-th packet is the 1st one.
                REQUIRE(analyzer.num_dropped_packets() == int64_t(UINT32_MAX) - 2 + 1);
            }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has one") { REQUIRE(analyzer.dropped_packets().size() == 1); }
            THEN("last packet has sequence number #2") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == 2); }
            THEN("newest packet has sequence number #1") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == 1); }
            THEN("newest packet timestamp is ts") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts); }
        }
    }

    GIVEN("a sequence that drops all packets between index 2 and the next index 1, three times in a row")
    {
        sequence_number_analyzer<uint32_t> analyzer;
        const clock::time_point ignore_timestamp {};
        const clock::time_point ts1 = clock::now();
        const clock::time_point ts2 = clock::now();
        const clock::time_point ts3 = clock::now();

        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(1, ts1);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(1, ts2);
        analyzer.handle_packet(2, ignore_timestamp);
        analyzer.handle_packet(1, ts3);

        WHEN("we check the dropped count")
        {
            THEN("it is " + std::to_string((int64_t(UINT32_MAX) - 2 + 1) * 3))
            {
                // + 1 because the 0-th packet is the 1st one.
                REQUIRE(analyzer.num_dropped_packets() == (int64_t(UINT32_MAX) - 2 + 1) * 3);
            }
        }
        WHEN("we check the dropped packet gaps")
        {
            THEN("it has three") { REQUIRE(analyzer.dropped_packets().size() == 3); }
            THEN("first gap's last packet has sequence number #2") { REQUIRE(analyzer.dropped_packets()[0].last_sequence_number == 2); }
            THEN("first gap's newest packet has sequence number #1") { REQUIRE(analyzer.dropped_packets()[0].first_sequence_number == 1); }
            THEN("first gap's newest packet timestamp is ts1") { REQUIRE(analyzer.dropped_packets()[0].first_packet_timestamp == ts1); }
            THEN("second gap's last packet has sequence number #2") { REQUIRE(analyzer.dropped_packets()[1].last_sequence_number == 2); }
            THEN("second gap's newest packet has sequence number #1") { REQUIRE(analyzer.dropped_packets()[1].first_sequence_number == 1); }
            THEN("second gap's newest packet timestamp is ts2") { REQUIRE(analyzer.dropped_packets()[1].first_packet_timestamp == ts2); }
            THEN("third gap's last packet has sequence number #2") { REQUIRE(analyzer.dropped_packets()[2].last_sequence_number == 2); }
            THEN("third gap's newest packet has sequence number #1") { REQUIRE(analyzer.dropped_packets()[2].first_sequence_number == 1); }
            THEN("third gap's newest packet timestamp is ts3") { REQUIRE(analyzer.dropped_packets()[2].first_packet_timestamp == ts3); }
        }
    }
}
