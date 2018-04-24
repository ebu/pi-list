#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/calculators.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

int64_t st2110::d21::calculate_n(fraction64 packet_time, fraction64 tframe)
{
    // TODO: without casting to double, this would overflow int64 calculations
    const auto n0 = static_cast<double>(packet_time) / static_cast<double>(tframe);
    return static_cast<int64_t>(std::floor(n0));
}
