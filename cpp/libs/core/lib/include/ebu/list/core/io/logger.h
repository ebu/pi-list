#pragma once

#include "spdlog/spdlog.h"

namespace ebu_list
{
    using logger_ptr = std::shared_ptr<spdlog::logger>;

    inline logger_ptr logger()
    {
        static const auto l = spdlog::stdout_logger_mt("console");

#if !defined(NDEBUG)
        l->set_level(spdlog::level::debug);
#endif // !defined(NDEBUG)

        return l;
    }
}