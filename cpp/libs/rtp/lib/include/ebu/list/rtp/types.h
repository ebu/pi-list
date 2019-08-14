#pragma once

#include <inttypes.h>
#include <optional>

//------------------------------------------------------------------------------

namespace ebu_list::rtp
{
    enum class ticks32 : int32_t {};
    ticks32 to_ticks32(int32_t t);
    int32_t from_ticks(ticks32 t);
    std::optional<int32_t> from_ticks(std::optional<ticks32> t);
}
