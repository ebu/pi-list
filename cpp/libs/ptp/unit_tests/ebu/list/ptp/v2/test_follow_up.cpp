#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/ptp/test_messages.h"
#include "ebu/list/ptp/v2/follow_up.h"
#include "ebu/list/ptp/v2/message_header.h"
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

SCENARIO("PTP follow up parsing")
{
    GIVEN("sync message 1")
    {
        auto pdu                 = oview(make_static_sbuffer(follow_up_1::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::follow_up message(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(message.header().value().type() == v2::message_type::follow_up);
                REQUIRE(message.header().value().sequence_id() == follow_up_1::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                const auto ts = message.message().precise_origin_timestamp();
                REQUIRE(ts == follow_up_1::precise_origin_timestamp);
            }
        }
    }
}
