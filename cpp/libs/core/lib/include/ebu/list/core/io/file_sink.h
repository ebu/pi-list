#pragma once

#include "ebu/list/core/io/data_source.h"
#include "ebu/list/core/platform/file.h"

//------------------------------------------------------------------------------

namespace ebu_list
{
    class file_sink
    {
      public:
        explicit file_sink(const path& path);

        void write(cbyte_span data);

      private:
        file_handle handle_;
    };
} // namespace ebu_list
