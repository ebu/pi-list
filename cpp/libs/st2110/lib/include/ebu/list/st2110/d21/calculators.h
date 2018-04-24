#pragma once

#include "ebu/list/core/math.h"

namespace ebu_list::st2110::d21
{
    int64_t calculate_n(fraction64 packet_time, fraction64 tframe);
}
