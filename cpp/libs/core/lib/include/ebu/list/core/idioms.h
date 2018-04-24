#pragma once

#include "bisect/bimo/idioms/enforce.h"
#include "fmt/format.h"
#include "fmt/ostream.h"

#define LIST_ENFORCE(_condition, _exception_type, ...) BIMO_ENFORCE(_condition, _exception_type, fmt::format(__VA_ARGS__) )
#define LIST_ASSERT(_condition) BIMO_ASSERT(_condition)
