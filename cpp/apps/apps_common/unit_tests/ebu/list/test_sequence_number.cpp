#include "catch2/catch.hpp"
#include "ebu/list/st2022_7/sequence_number.h"
using namespace ebu_list;
using namespace ebu_list::sequence_number;

//------------------------------------------------------------------------------

SCENARIO("Test sequence number helpers")
{
    GIVEN("two sequence numbers")
    {
        WHEN("they are equal")
        {
            const auto a = uint32_t(0x12345678);
            const auto b = uint32_t(0x12345678);
            THEN("the result should be equal") { REQUIRE(sequence_number::compare(a, b) == compare_result::equal); }
        }
        WHEN("a is before b")
        {
            const auto a = uint32_t(0x12345670);
            const auto b = uint32_t(0x12345678);
            THEN("the result should be a is before b")
            {
                REQUIRE(sequence_number::compare(a, b) == compare_result::a_before_b);
            }
        }
        WHEN("a is after b")
        {
            const auto a = uint32_t(0x12345680);
            const auto b = uint32_t(0x12345678);
            THEN("the result should be a is after b")
            {
                REQUIRE(sequence_number::compare(a, b) == compare_result::a_after_b);
            }
        }
    }

    GIVEN("two sequence numbers after wrap around")
    {
        WHEN("a is before b")
        {
            const auto a = uint32_t(0xFFFFFFFF);
            const auto b = uint32_t(0x00000000);
            THEN("the result should be a is before b")
            {
                REQUIRE(sequence_number::compare(a, b) == compare_result::a_before_b);
            }
        }
        WHEN("a is after b")
        {
            const auto a = uint32_t(0x00000000);
            const auto b = uint32_t(0xFFFFFFFF);
            THEN("the result should be a is after b")
            {
                REQUIRE(sequence_number::compare(a, b) == compare_result::a_after_b);
            }
        }
    }
}
