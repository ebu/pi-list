#include "catch2/catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/types.h"
#include "ebu/list/ptp/test_messages.h"
#include "ebu/list/ptp/v2/sync.h"
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

SCENARIO("PTP sync parsing")
{
    GIVEN("sync message 1")
    {
        auto pdu                 = oview(make_static_sbuffer(sync_1::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::sync sync(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(sync.header().value().type() == v2::message_type::sync);
                REQUIRE(sync.header().value().sequence_id() == sync_1::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                const auto ts = sync.message().origin_timestamp();
                REQUIRE(ts == sync_1::origin_timestamp);
            }
        }
    }

    GIVEN("sync message 2")
    {
        auto pdu                 = oview(make_static_sbuffer(sync_2::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::sync sync(clock::time_point{}, std::move(header), std::move(remainder));

            THEN("the header is correct")
            {
                REQUIRE(sync.header().value().type() == v2::message_type::sync);
                REQUIRE(sync.header().value().sequence_id() == sync_2::sequence_id);
            }

            AND_THEN("the origin_timestamp is correct")
            {
                const auto ts = sync.message().origin_timestamp();
                REQUIRE(ts == sync_2::origin_timestamp);
            }
        }
    }

    GIVEN("a sync message with a large ts")
    {
        auto pdu                 = oview(make_static_sbuffer(sync_3::data));
        auto [header, remainder] = v2::take_header(std::move(pdu));

        WHEN("we parse it")
        {
            v2::sync sync(clock::time_point{}, std::move(header), std::move(remainder));

            AND_THEN("the origin_timestamp is correct")
            {
                const auto ts = sync.message().origin_timestamp();
                REQUIRE(ts == sync_3::origin_timestamp);
            }
        }
    }
}
