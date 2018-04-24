#pragma once

#pragma warning(disable: 4996)

#if defined(_WIN32)
#include <SDKDDKVer.h>
#include <tchar.h>
#endif // defined(_WIN32)

#include <array>
#include <cassert>
#include <chrono>
#include <cinttypes>
#include <iomanip>
#include <iostream>
#include <memory>
#include <optional>
#include <sstream>
#include <cstdio>
#include <string>
#include <tuple>
#include <type_traits>
#include <variant>

#include "spdlog/spdlog.h"
#include "gsl/gsl"
