#include "pch.h"

#define CATCH_CONFIG_ENABLE_CHRONO_STRINGMAKER

#include "catch2/catch.hpp"
#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/ptp_offset_calculator.h"
#include "ebu/list/ptp/v2/sync.h"
#include "ebu/list/ptp/v2/test_sequences.h"
#include <vector>
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

SCENARIO("PTP Offset Calculator")
{

    GIVEN("a state machine")
    {
        ptp_offset_calculator c;

        WHEN("we message is received")
        {
            THEN("it reports that it has no data")
            {
                const auto maybe_info = c.get_info();
                REQUIRE(!maybe_info.has_value());
            }
        }

        WHEN("we provide a two-step message")
        {
            c.on_data(two_step_sequence_1::get_sync());
            c.on_data(two_step_sequence_1::get_follow_up());
            c.on_complete();

            THEN("it calculates the right offset")
            {
                const auto maybe_info = c.get_info();
                REQUIRE(maybe_info.has_value());
                const auto info = *maybe_info;
                REQUIRE(info.average_offset == std::chrono::nanoseconds(-37204848445));
                REQUIRE(info.is_two_step);
                REQUIRE(*info.is_two_step);
                REQUIRE(!info.master_id);
                REQUIRE(!info.grandmaster_id);
            }
        }

        WHEN("we provide a one-step message")
        {
            c.on_data(two_step_sequence_1::get_sync_with_timestamp());
            c.on_complete();

            THEN("it calculates the right offset")
            {
                const auto maybe_info = c.get_info();
                REQUIRE(maybe_info.has_value());
                const auto info = *maybe_info;
                REQUIRE(info.average_offset == std::chrono::nanoseconds(-37204848445));
                REQUIRE(info.is_two_step);
                REQUIRE(!*info.is_two_step);
                REQUIRE(!info.master_id);
                REQUIRE(!info.grandmaster_id);
            }
        }

        WHEN("we provide two sequences")
        {
            c.on_data(two_step_sequence_1::get_sync());
            c.on_data(two_step_sequence_1::get_follow_up());
            c.on_data(two_step_sequence_1::get_sync_with_timestamp());
            c.on_complete();

            THEN("it calculates the right offset")
            {
                const auto maybe_info = c.get_info();
                REQUIRE(maybe_info.has_value());
                const auto info = *maybe_info;
                REQUIRE(info.average_offset == std::chrono::nanoseconds(-37204848445));
                REQUIRE(info.is_two_step);
                REQUIRE(!*info.is_two_step);
                REQUIRE(!info.master_id);
                REQUIRE(!info.grandmaster_id);
            }
        }
    }
}
