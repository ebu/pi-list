#pragma once

#include "nlohmann/json.hpp"

namespace ebu_list::st2022_7
{
    nlohmann::json analyse(const nlohmann::json& configuration) noexcept;
} // namespace ebu_list
