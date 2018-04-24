#include "ebu/list/serialization/utils.h"

#include <fstream>

void ebu_list::write_json_to(const path& dir, const std::string& filename, const nlohmann::json& content)
{
    std::experimental::filesystem::create_directories(dir);
    const auto info_path = dir / filename;

    std::ofstream o(info_path.string());
    o << std::setw(4) << content << std::endl;
}

nlohmann::json ebu_list::read_from_file(const ebu_list::path& file)
{
    std::ifstream i(file);
    nlohmann::json j;
    i >> j;

    return j;
}