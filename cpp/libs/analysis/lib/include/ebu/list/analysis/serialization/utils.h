#pragma once

#include "ebu/list/core/types.h"
#include "nlohmann/json.hpp"

namespace ebu_list::analysis
{
    void write_json_to(const path& dir, const std::string& filename, const nlohmann::json& content);
}