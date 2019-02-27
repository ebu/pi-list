#pragma once

#include "bisect/bimo/idioms/enforce.h"
#include "fmt/format.h"
#include "fmt/ostream.h"
#include <functional>

#define LIST_ENFORCE(_condition, _exception_type, ...) BIMO_ENFORCE(_condition, _exception_type, fmt::format(__VA_ARGS__) )
#define LIST_ASSERT(_condition) BIMO_ASSERT(_condition)

class scope_guard
{
public:
    using f_t = std::function<void()>;

    scope_guard(f_t&& f)
    : f_(std::move(f))
    {
    }

    ~scope_guard()
    {
        f_();
    }

private:
    f_t f_;
};
