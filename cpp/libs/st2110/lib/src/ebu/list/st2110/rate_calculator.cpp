#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/rate_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------
namespace
{
    constexpr auto clock_rate = 90000; // from ST2110-10
}

void rate_calculator::on_packet(uint32_t timestamp)
{
    if (timestamps_.size() > 2) return;

    if (timestamps_.find(timestamp) == timestamps_.end())
    {
        timestamps_.insert(timestamp);
    }
}

std::optional<media::video::Rate> rate_calculator::rate() const
{
    // TODO: deal with invalid values

    if (timestamps_.size() < 3) return std::nullopt;

    auto it = timestamps_.begin();
    auto t0 = *it++;
    auto t1 = *it++;
    auto t2 = *it;

    const auto d1 = t1 - t0;
    const auto d2 = t2 - t1;

    if (d1 == 0 || d2 == 0) return media::video::Rate(0,1);
    return media::video::Rate(clock_rate * 2, d1 + d2);
}
