#pragma once

//------------------------------------------------------------------------------

namespace ebu_list::platform::config
{
#if defined(WIN32)
#   define LIST_HAS_WIN32
    constexpr auto windows = true;
    constexpr auto posix = false;
#else // defined(_WIN32)
#   define LIST_HAS_POSIX
    constexpr auto windows = false;
    constexpr auto posix = true;
#endif

#if defined(WIN32)
#   if !defined(_M_X64)
        static_assert(false, "only 64-bit is supported currently");
#   endif // !defined(_M_X64)
#endif // defined(WIN32)

#if defined(WIN32)
    constexpr auto little_endian = true;
#elif defined(__clang__) && defined(__x86_64__)
    constexpr auto little_endian = true;
#elif defined(__x86_64__)
    constexpr auto little_endian = true;
#else
    static_assert(false, "unknown architecture");
#endif

    constexpr auto use_secure_functions = windows ? true : false;
}
