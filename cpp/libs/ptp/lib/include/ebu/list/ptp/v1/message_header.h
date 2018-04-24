#pragma once

#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp::v1
{
#pragma pack(push, 1)
    struct header
    {
    };

    static_assert(sizeof(header) == 1);
#pragma pack(pop)

    // TODO: just a placeholder now
    class message
    {
    };
}
