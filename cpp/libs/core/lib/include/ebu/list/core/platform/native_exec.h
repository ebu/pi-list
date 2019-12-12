#pragma once

#include <string_view>

namespace ebu_list
{
    enum class exit_code
    {
        success,
        error
    };

    exit_code native_exec(std::string_view command);
} // namespace ebu_list