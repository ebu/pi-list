#include "ebu/list/rtp/types.h"

using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

ticks32 rtp::to_ticks32(int32_t t)
{
    return static_cast<ticks32>(t);
}

int32_t rtp::from_ticks(ticks32 t)
{
    return static_cast<int32_t>(t);
}

std::optional<int32_t> rtp::from_ticks(std::optional<ticks32> t)
{
    if (!t) return std::nullopt;
    return from_ticks(*t);
}
