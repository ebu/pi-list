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

#pragma warning(push)
#pragma warning(disable: 4127)
#include "fmt/printf.h"
#pragma warning(pop)

#if defined(_WIN32)
#include <WinSock2.h>
#include <Ws2tcpip.h>
#pragma comment(lib, "Ws2_32.lib")
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#endif

#undef min
#undef max
