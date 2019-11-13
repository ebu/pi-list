#pragma once

#include "bisect/bimo/idioms/enforce.h"
#include "bisect/bimo/types.h"
#include "fmt/format.h"
#include "fmt/ostream.h"
#include <functional>

namespace ebu_list
{
    using bisect::bimo::ssizeof;

    class scope_guard
    {
      public:
        using f_t = std::function<void()>;

        scope_guard(f_t&& f) : f_(std::move(f)) {}

        ~scope_guard() { f_(); }

      private:
        f_t f_;
    };
} // namespace ebu_list

#define LIST_ENFORCE(_condition, _exception_type, ...)                                                                 \
    BIMO_ENFORCE(_condition, _exception_type, fmt::format(__VA_ARGS__))
#define LIST_ASSERT(_condition) BIMO_ASSERT(_condition)
