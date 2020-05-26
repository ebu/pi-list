#pragma once

#include "ebu/list/core/io/data_source.h"
#include "ebu/list/core/memory/bimo.h"

//------------------------------------------------------------------------------

namespace ebu_list
{
    class chunked_data_source
    {
      public:
        chunked_data_source(sbuffer_factory_ptr factory, data_source_uptr source);
        chunked_data_source(chunked_data_source&) = delete;
        chunked_data_source& operator=(chunked_data_source&) = delete;
        chunked_data_source(chunked_data_source&&)           = delete;
        chunked_data_source& operator=(chunked_data_source&&) = delete;

        // throws if EOF
        oview read_exactly(ptrdiff_t amount);

        // returns a smaller oview if EOF
        oview try_read_exactly(ptrdiff_t amount);

        sbuffer_factory& get_factory() const;

        size_t get_current_offset() const;

      public:
        sbuffer_factory_ptr factory_;
        data_source_uptr source_;
        oview cache_;
        size_t current_offset_ = 0;
    };
} // namespace ebu_list
