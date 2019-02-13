#include "pch.h"

#include "ebu/list/rtp/decoder.h"
#include "ebu/list/rtp/test_packets.h"
#include "ebu/list/core/memory/bimo.h"
#include "catch.hpp"
using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

SCENARIO("RTP decoding")
{
    GIVEN("a valid RTP packet")
    {
        auto data = oview(make_static_sbuffer(test::header_1::data));

        WHEN("we decode it")
        {
            auto decode_result = decode(std::move(data));

            THEN("the values are correct")
            {
                REQUIRE(decode_result);
                auto full_packet = std::move(decode_result.value());
                auto& header = std::get<0>(full_packet);
                auto& sdu = std::get<1>(full_packet);

                REQUIRE(header.view().version() == test::header_1::version);
                REQUIRE(header.view().padding() == test::header_1::padding);
                REQUIRE(header.view().extension() == test::header_1::extension);
                REQUIRE(header.view().csrc_count() == test::header_1::csrc_count);
                REQUIRE(header.view().marker() == test::header_1::marker);
                REQUIRE(header.view().payload_type() == test::header_1::payload_type);
                REQUIRE(header.view().sequence_number() == test::header_1::sequence_number);
                REQUIRE(header.view().timestamp() == test::header_1::timestamp);
                REQUIRE(header.view().ssrc() == test::header_1::ssrc);

                REQUIRE(sdu.view().size() == test::header_1::payload_size);
            }
        }
    }

    GIVEN("a RTP packet with header extensions")
    {
        auto data = oview(make_static_sbuffer(test::header_with_extension::data));

        WHEN("we decode it")
        {
            auto decode_result = decode(std::move(data));

            THEN("the values are correct")
            {
                REQUIRE(decode_result);
                auto full_packet = std::move(decode_result.value());
                auto& header = std::get<0>(full_packet);
                auto& sdu = std::get<1>(full_packet);

                REQUIRE(header.view().version() == test::header_with_extension::version);
                REQUIRE(header.view().padding() == test::header_with_extension::padding);
                REQUIRE(header.view().extension() == test::header_with_extension::extension);
                REQUIRE(header.view().csrc_count() == test::header_with_extension::csrc_count);
                REQUIRE(header.view().marker() == test::header_with_extension::marker);
                REQUIRE(header.view().payload_type() == test::header_with_extension::payload_type);
                REQUIRE(header.view().sequence_number() == test::header_with_extension::sequence_number);
                REQUIRE(header.view().timestamp() == test::header_with_extension::timestamp);
                REQUIRE(header.view().ssrc() == test::header_with_extension::ssrc);

                REQUIRE(sdu.view().size() == test::header_with_extension::payload_size);
            }
        }
    }
}
