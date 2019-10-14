#include "pch.h"

#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/v2/sync.h"
#include "test_sequences.h"
#include "catch.hpp"
#include <vector>
using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2::test;

//------------------------------------------------------------------------------

class sm_listener : public ptp::state_machine::listener
{
public:
    std::vector<ptp::state_machine::on_sync_data> messages;
    int on_complete_count = 0;
    int on_error_count = 0;

private:
    void on_data(const ptp::state_machine::on_sync_data& data)
    {
        messages.push_back(data);
    }

    void on_complete() override
    {
        ++on_complete_count;
    }

    void on_error([[ maybe_unused ]] std::exception_ptr e)
    {
        ++on_error_count;
    }
};
//------------------------------------------------------------------------------

namespace Catch 
{
    template<>
    struct StringMaker<std::chrono::nanoseconds>
    {
        static std::string convert(std::chrono::nanoseconds const& value)
        {
            return std::to_string(value.count()) + "ns";
        }
    };
}

SCENARIO("PTP state machine")
{
    GIVEN("a state machine")
    {
        auto listener = std::make_shared<sm_listener>();
        state_machine sm(listener);

        WHEN("we provide a two-step message")
        {
            sm.on_data(two_step_sequence_1::get_sync());
            sm.on_data(two_step_sequence_1::get_follow_up());
            sm.on_data(two_step_sequence_1::get_delay_req());
            sm.on_data(two_step_sequence_1::get_delay_resp());
            sm.on_complete();

            THEN("it calculates the right offset")
            {
                REQUIRE(listener->on_complete_count == 1);
                REQUIRE(listener->on_error_count == 0);
                REQUIRE(listener->messages.size() == 1);
                const auto& m0 = listener->messages[0];
                REQUIRE(m0.offset_from_master == std::chrono::nanoseconds(-37204847866));
            }
        }

        WHEN("we provide a one-step message")
        {
            sm.on_data(two_step_sequence_1::get_sync_with_timestamp());
            sm.on_data(two_step_sequence_1::get_delay_req());
            sm.on_data(two_step_sequence_1::get_delay_resp());
            sm.on_complete();

            THEN("it calculates the right offset")
            {
                REQUIRE(listener->on_complete_count == 1);
                REQUIRE(listener->on_error_count == 0);
                REQUIRE(listener->messages.size() == 1);
                const auto& m0 = listener->messages[0];
                REQUIRE(m0.offset_from_master == std::chrono::nanoseconds(-37204847866));
            }
        }
    }
}
