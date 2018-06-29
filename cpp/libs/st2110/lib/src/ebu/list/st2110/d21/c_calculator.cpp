#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/c_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------
namespace
{
    constexpr fraction64 B{ 11, 10 };  // Drain factor as defined in SMPTE2110 - 21

    fraction64 calculate_t_drain_ns(fraction64 tframe, int64_t npackets)
    {
        const auto t1 = tframe / npackets;
        const auto t2_ns = t1 * 1'000'000'000;
        return t2_ns / B;
    }
}

//------------------------------------------------------------------------------

c_calculator::c_calculator(int64_t npackets, media::video::Rate rate)
    : npackets_(npackets),
    tframe_(1 / rate),
    t_drain_ns_(calculate_t_drain_ns(tframe_, npackets_))
{
}

int c_calculator::on_packet(const clock::time_point& packet_time)
{
    const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(packet_time.time_since_epoch()).count();

    if (!initial_time_.has_value())
    {
        initial_time_ = packet_time_ns;

        last_cinst_ = 0;
        cleared_.push_back(0);

        return last_cinst_;
    }

    const auto fclear_number = (packet_time_ns - initial_time_.value()) / t_drain_ns_;
    const auto clear_number = static_cast<int>(floor(fclear_number));
    cleared_.push_back(clear_number);
    const auto buffer = last_cinst_ + 1 - (cleared_.at(cleared_.size() - 1) - cleared_.at(cleared_.size() - 2));

    const auto cinst = buffer >= 0 ? buffer : 0;
    last_cinst_ = cinst;

    if (cleared_.size() > 2) cleared_.erase(cleared_.begin());

    return cinst;
}
