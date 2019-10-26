#pragma once

#include "ebu/list/core/memory/bimo.h"

//------------------------------------------------------------------------------

namespace ebu_list
{
    class data_source
    {
      public:
        virtual ~data_source() = default;

        // returns oview() if EOF
        virtual oview read_next() = 0;
    };

    using data_source_uptr = std::unique_ptr<data_source>;
} // namespace ebu_list
