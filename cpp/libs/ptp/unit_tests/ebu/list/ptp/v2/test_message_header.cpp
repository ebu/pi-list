#include "catch2/catch.hpp"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/ptp/test_messages.h"
#include "ebu/list/ptp/v2/message_header.h"
#include "ebu/list/ptp/v2/sync.h"
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

SCENARIO("PTPv2 header parsing")
{
    GIVEN("sync message 1")
    {
        auto pdu = oview(make_static_sbuffer(sync_1::data));

        WHEN("we take its header")
        {
            const auto [header, remainder] = take_header(std::move(pdu));

            THEN("the header is correct") { REQUIRE(header.value().sequence_id() == sync_1::sequence_id); }

            AND_THEN("the remainder of the message is correct")
            {
                REQUIRE(equal(remainder, to_byte_array(0x00, 0x00, 0x45, 0xb1, 0x11, 0x49, 0x2e, 0x32, 0x42, 0x63)));
            }
        }
    }
}
