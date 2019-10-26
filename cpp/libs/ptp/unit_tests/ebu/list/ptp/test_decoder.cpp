#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/test_messages.h"
#include "ebu/list/ptp/v2/sync.h"
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp;

//------------------------------------------------------------------------------

SCENARIO("PTP decoding")
{
    GIVEN("v2 sync message 1")
    {
        auto pdu = oview(make_static_sbuffer(v2::test::sync_1::data));

        WHEN("we decode it")
        {
            auto decode_result = decode(clock::time_point{}, std::move(pdu));

            THEN("the type is correctly inferred")
            {
                REQUIRE(decode_result);
                auto message = std::get<v2::sync>(decode_result.value());
                REQUIRE(message.header().value().type() == v2::message_type::sync);
            }
        }
    }

    GIVEN("v2 follow_up message 1")
    {
        auto pdu = oview(make_static_sbuffer(v2::test::follow_up_1::data));

        WHEN("we decode it")
        {
            auto decode_result = decode(clock::time_point{}, std::move(pdu));

            THEN("the type is correctly inferred")
            {
                REQUIRE(decode_result);
                auto message = std::get<v2::follow_up>(decode_result.value());
                REQUIRE(message.header().value().type() == v2::message_type::follow_up);
            }
        }
    }

    GIVEN("v1 sync message")
    {
        auto pdu = oview(make_static_sbuffer(v1::test::sync_1::data));

        WHEN("we decode it")
        {
            auto decode_result = decode(clock::time_point{}, std::move(pdu));

            THEN("the type is correctly inferred") { REQUIRE(decode_result); }
        }
    }

    GIVEN("invalid data")
    {
        auto pdu = oview(make_static_sbuffer(to_byte_array(0x01, 0x00, 0x30, 0x05, 0x1d, 0x1e, 0x27, 0x00)));

        WHEN("we decode it")
        {
            auto decode_result = decode(clock::time_point{}, std::move(pdu));

            THEN("decode returns no data") { REQUIRE_FALSE(decode_result); }
        }
    }

    GIVEN("a shorter v2 sync message")
    {
        // TODO: fuzz point
        auto data    = std::array<byte, 20>();
        auto shorter = gsl::make_span(v2::test::sync_1::data).subspan(10, data.size());
        ebu_list::copy(shorter, data);
        auto pdu = oview(make_static_sbuffer(data));

        WHEN("we decode it")
        {
            auto decode_result = decode(clock::time_point{}, std::move(pdu));

            THEN("decode returns no data") { REQUIRE_FALSE(decode_result); }
        }
    }
}
