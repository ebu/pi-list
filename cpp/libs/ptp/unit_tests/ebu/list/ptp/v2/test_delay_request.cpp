#include "pch.h"

#include "catch2/catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/ptp/test_messages.h"
#include "ebu/list/ptp/v2/delay_req.h"
#include "ebu/list/ptp/v2/message_header.h"
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

SCENARIO("PTP delay request parsing")
{
    GIVEN("delay_request message 1")
    {
        auto pdu                 = oview(make_static_sbuffer(delay_request_1::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::delay_req message(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(message.header().value().type() == v2::message_type::delay_req);
                REQUIRE(message.header().value().sequence_id() == delay_request_1::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                const auto ts = message.message().origin_timestamp();
                REQUIRE(ts == delay_request_1::precise_origin_timestamp);
            }
        }
    }

    GIVEN("delay_request message 2")
    {
        auto pdu                 = oview(make_static_sbuffer(delay_request_2::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::delay_req message(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(message.header().value().type() == v2::message_type::delay_req);
                REQUIRE(message.header().value().sequence_id() == delay_request_2::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                const auto ts = message.message().origin_timestamp();
                REQUIRE(ts == delay_request_2::precise_origin_timestamp);
            }
        }
    }
}
