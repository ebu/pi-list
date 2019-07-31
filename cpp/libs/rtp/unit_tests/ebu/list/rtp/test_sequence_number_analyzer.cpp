#include "pch.h"

#include "ebu/list/rtp/sequence_number_analyzer.h"
#include "catch.hpp"
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
            THEN("it is 0")
            {
                REQUIRE(analyzer.dropped_packets() == 0);
            }
        }
    }

    GIVEN("a continuous sequence")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(0);
        analyzer.handle_packet(1);
        analyzer.handle_packet(2);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 0")
            {
                REQUIRE(analyzer.dropped_packets() == 0);
            }
        }
    }

    GIVEN("a continuous sequence which crosses the numeric limits")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(UINT32_MAX - 4);
        analyzer.handle_packet(UINT32_MAX - 3);
        analyzer.handle_packet(UINT32_MAX - 2);
        analyzer.handle_packet(UINT32_MAX - 1);
        analyzer.handle_packet(UINT32_MAX);
        analyzer.handle_packet(0);
        analyzer.handle_packet(1);
        analyzer.handle_packet(2);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 0")
            {
                REQUIRE(analyzer.dropped_packets() == 0);
            }
        }
    }

    GIVEN("a sequence with a single missed packet")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(0);
        analyzer.handle_packet(1);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 1")
            {
                REQUIRE(analyzer.dropped_packets() == 1);
            }
        }
    }

    GIVEN("a sequence with a 5 missed packets")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(0);
        analyzer.handle_packet(1);
        analyzer.handle_packet(7);

        WHEN("we check the dropped count")
        {
            THEN("it is 5")
            {
                REQUIRE(analyzer.dropped_packets() == 5);
            }
        }
    }

    GIVEN("a sequence with a 5 missed packets before the numeric limit")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(UINT32_MAX - 6);
        analyzer.handle_packet(UINT32_MAX);
        analyzer.handle_packet(0);

        WHEN("we check the dropped count")
        {
            THEN("it is 5")
            {
                REQUIRE(analyzer.dropped_packets() == 5);
            }
        }
    }

    GIVEN("a sequence with a single missed packet at the numeric limit")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(UINT32_MAX - 4);
        analyzer.handle_packet(UINT32_MAX - 3);
        analyzer.handle_packet(UINT32_MAX - 2);
        analyzer.handle_packet(UINT32_MAX - 1);
        analyzer.handle_packet(0);
        analyzer.handle_packet(1);
        analyzer.handle_packet(2);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 1")
            {
                REQUIRE(analyzer.dropped_packets() == 1);
            }
        }
    }

    GIVEN("a sequence with a 5 missed packets around the numeric limit")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(UINT32_MAX - 4);
        analyzer.handle_packet(UINT32_MAX - 1);
        analyzer.handle_packet(0);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 5")
            {
                REQUIRE(analyzer.dropped_packets() == 5);
            }
        }
    }

    GIVEN("a sequence with a single missed packet at the 16-bit numeric limit")
    {
        sequence_number_analyzer<uint16_t> analyzer;

        analyzer.handle_packet(UINT16_MAX - 4);
        analyzer.handle_packet(UINT16_MAX - 3);
        analyzer.handle_packet(UINT16_MAX - 2);
        analyzer.handle_packet(UINT16_MAX - 1);
        analyzer.handle_packet(0);
        analyzer.handle_packet(1);
        analyzer.handle_packet(2);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 1")
            {
                REQUIRE(analyzer.dropped_packets() == 1);
            }
        }
    }

    GIVEN("a sequence with a 5 missed packets around the 16-bit numeric limit")
    {
        sequence_number_analyzer<uint16_t> analyzer;

        analyzer.handle_packet(UINT16_MAX - 4);
        analyzer.handle_packet(UINT16_MAX - 1);
        analyzer.handle_packet(0);
        analyzer.handle_packet(3);

        WHEN("we check the dropped count")
        {
            THEN("it is 5")
            {
                REQUIRE(analyzer.dropped_packets() == 5);
            }
        }
    }

    GIVEN("a sequence that drops all packackets except for the one " \
          "at the lower and upper numeric limits")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(0);
        analyzer.handle_packet(std::numeric_limits<uint32_t>::max());

        WHEN("we check the dropped count")
        {
            THEN("it is " + std::to_string(std::numeric_limits<uint32_t>::max() + 1 - 2))
            {
                // + 1 because the 0-th packet is the 1st one.
                REQUIRE(analyzer.dropped_packets() == std::numeric_limits<uint32_t>::max() - 2 + 1);
            }
        }
    }

    GIVEN("a sequence that dropps all packets between index 2 and the next index 1")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(2);
        analyzer.handle_packet(1);

        WHEN("we check the dropped count")
        {
            THEN("it is " + std::to_string(int64_t(std::numeric_limits<uint32_t>::max()) - 2 + 1))
            {
                // + 1 because the 0-th packet is the 1st one.
                REQUIRE(analyzer.dropped_packets() == int64_t(std::numeric_limits<uint32_t>::max()) - 2 + 1);
            }
        }
    }

    GIVEN("a sequence that dropps all packets between index 2 and the next index 1, three times in a row")
    {
        sequence_number_analyzer<uint32_t> analyzer;

        analyzer.handle_packet(2);
        analyzer.handle_packet(1);
        analyzer.handle_packet(2);
        analyzer.handle_packet(1);
        analyzer.handle_packet(2);
        analyzer.handle_packet(1);

        WHEN("we check the dropped count")
        {
            THEN("it is " + std::to_string((int64_t(std::numeric_limits<uint32_t>::max()) - 2 + 1) * 3))
            {
                // + 1 because the 0-th packet is the 1st one.
                REQUIRE(analyzer.dropped_packets() == (int64_t(std::numeric_limits<uint32_t>::max()) - 2 + 1) * 3);
            }
        }
    }
}
