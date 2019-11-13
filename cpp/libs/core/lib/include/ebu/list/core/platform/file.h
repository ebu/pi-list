#pragma once

#include "ebu/list/core/types.h"
#include <cstdio>
#include <experimental/filesystem>

namespace ebu_list
{
    class file_handle
    {
      public:
        enum mode
        {
            read,
            write
        };
        explicit file_handle(const path& path, mode _mode = mode::read);
        ~file_handle();

        FILE* handle();
        explicit operator bool() const;

      private:
        file_handle(file_handle&) = delete;
        file_handle& operator=(file_handle&) = delete;
        file_handle(file_handle&&)           = delete;
        file_handle& operator=(file_handle&&) = delete;

        FILE* const handle_ = nullptr;
    };

    size_t write(file_handle& f, cbyte_span buffer);

    using std::experimental::filesystem::create_directories;
} // namespace ebu_list
