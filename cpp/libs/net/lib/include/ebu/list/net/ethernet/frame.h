#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/types.h"
#include <optional>

namespace ebu_list::ethernet
{
    struct frame
    {
        clock::time_point timestamp;
        oview data;
    };

    using maybe_frame = std::optional<frame>;
} // namespace ebu_list::ethernet
