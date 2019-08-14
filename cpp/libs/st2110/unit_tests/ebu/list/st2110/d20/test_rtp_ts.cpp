#include "pch.h"
#include "ebu/list/st2110/d20/rtp_utils.h"
#include "catch.hpp"

using namespace ebu_list;
using namespace ebu_list::rtp;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------
SCENARIO("test calculate_rtp_timestamp")
{
    GIVEN("a packet TS")
    {
        const auto packet_ts = fraction64(1563924787420727121, 1000000000);
        WHEN("we calculate the corresponding RTP timestamp")
        {
            const auto ts = calculate_rtp_timestamp(packet_ts);
            THEN("we get the right value")
            {
                REQUIRE(ts == 2857610649);
            }
        }
    }
}

SCENARIO("test calculate_n")
{
    GIVEN("a packet TS and a frame period")
    {
        const auto packet_ts = fraction64(1563924787420727121, 1000000000);
        const auto frame_period = fraction64(1, 50);
        WHEN("we calculate the corresponding frame number")
        {
            const auto n = calculate_n(packet_ts, frame_period);
            THEN("we get the right value")
            {
                REQUIRE(n == 78196239371);
            }
        }
    }
}

SCENARIO("test calculate_rtp_to_packet_deltas")
{
    GIVEN("a packet TS, a RTP TS and a frame period")
    {
        const auto frame_period = fraction64(1, 50);
        const auto rtp_ts = uint32_t(2857610649);
        const auto packet_ts = fraction64(1563924787420727121, 1000000000);
        WHEN("we calculate the corresponding frame number")
        {
            const auto deltas = calculate_rtp_to_packet_deltas(frame_period, rtp_ts, packet_ts);
            THEN("we get the right values")
            {
                REQUIRE(deltas.delta_rtp_vs_packet_time == to_ticks32(0));
                REQUIRE(deltas.delta_rtp_vs_NTs == to_ticks32(65));
                REQUIRE(deltas.delta_packet_time_vs_rtp_time == std::chrono::nanoseconds(4898));
            }
        }
    }
}
