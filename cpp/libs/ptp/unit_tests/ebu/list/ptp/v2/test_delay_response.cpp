#include "catch2/catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/ptp/test_messages.h"
#include "ebu/list/ptp/v2/delay_resp.h"
#include "ebu/list/ptp/v2/message_header.h"
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

SCENARIO("PTP delay response parsing")
{
    GIVEN("delay response message 1")
    {
        auto pdu                 = oview(make_static_sbuffer(delay_response_1::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::delay_resp message(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(message.header().value().type() == v2::message_type::delay_resp);
                REQUIRE(message.header().value().sequence_id() == delay_response_1::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                REQUIRE(message.message().receive_timestamp() == delay_response_1::receive_timestamp);
                REQUIRE(message.message().requesting_port_identity() == delay_response_1::requesting_port_identity);
            }
        }
    }

    GIVEN("delay response message 2")
    {
        auto pdu                 = oview(make_static_sbuffer(delay_response_2::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::delay_resp message(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(message.header().value().type() == v2::message_type::delay_resp);
                REQUIRE(message.header().value().sequence_id() == delay_response_2::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                REQUIRE(message.message().receive_timestamp() == delay_response_2::receive_timestamp);
                REQUIRE(message.message().requesting_port_identity() == delay_response_2::requesting_port_identity);
            }
        }
    }
}
