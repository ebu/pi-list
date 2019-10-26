#include "pch.h"

#include "catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/rtp/header.h"
#include "ebu/list/rtp/test_packets.h"
using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

SCENARIO("RTP header")
{
    GIVEN("a valid RTP header")
    {
        auto header_data = oview(make_static_sbuffer(test::header_1::data));

        WHEN("we map it to the raw_header")
        {
            const auto header = reinterpret_cast<const raw_header*>(header_data.view().data());
            THEN("the values are correct")
            {
                REQUIRE(header->version == test::header_1::version);
                REQUIRE(header->padding == (test::header_1::padding ? 1 : 0));
                REQUIRE(header->extension == (test::header_1::extension ? 1 : 0));
                REQUIRE(header->csrc_count == test::header_1::csrc_count);
                REQUIRE(header->marker == (test::header_1::marker ? 1 : 0));
                REQUIRE(header->payload_type == test::header_1::payload_type);
                REQUIRE(to_native(header->sequence_number) == test::header_1::sequence_number);
                REQUIRE(to_native(header->timestamp) == test::header_1::timestamp);
                REQUIRE(to_native(header->ssrc) == test::header_1::ssrc);
            }
        }
    }
}
