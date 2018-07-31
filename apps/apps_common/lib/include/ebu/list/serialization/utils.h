#pragma once

#include "nlohmann/json.hpp"
#include "ebu/list/core/types.h"

namespace ebu_list
{
    void write_json_to(const path& dir, const std::string& filename, const nlohmann::json& content);
}