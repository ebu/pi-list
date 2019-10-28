#pragma once

#pragma warning(disable : 4996)

#if defined(_WIN32)
#include <SDKDDKVer.h>
#include <tchar.h>
#endif // defined(_WIN32)

#include <array>
#include <cassert>
#include <chrono>
#include <cinttypes>
#include <cstdio>
#include <iomanip>
#include <iostream>
#include <memory>
#include <optional>
#include <sstream>
#include <string>
#include <tuple>
#include <type_traits>
#include <variant>

#include "gsl/gsl"
#include "spdlog/spdlog.h"

#pragma warning(push)
#pragma warning(disable : 4127)
#include "fmt/printf.h"
#pragma warning(pop)