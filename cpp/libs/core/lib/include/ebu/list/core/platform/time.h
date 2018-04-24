#pragma once

#include <chrono>
#include <string>

namespace ebu_list
{
    // A clock with nanosecond resolution and epoch at UNIX's epoch
    struct clock
    {
        using rep = long long;
        using period = std::nano;
        using duration = std::chrono::nanoseconds;
        using time_point = std::chrono::time_point<clock>;
        static constexpr bool is_steady = true;

        static time_point now() noexcept
        {
            const auto as_ns_since_system_epoch = std::chrono::time_point_cast<std::chrono::nanoseconds>(std::chrono::steady_clock::now()).time_since_epoch();
            // TODO: deal with clock epoch being different from system's epoch
            return time_point{ as_ns_since_system_epoch };
        }
    };

    std::string to_date_time_string(const clock::time_point& tp);
}
