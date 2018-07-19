#pragma once

#include <memory>
#include "nlohmann/json.hpp"

namespace ebu_list
{
    using json = nlohmann::json;
    using maybe_result = std::optional<json>;

    class db_serializer
    {
    public:
        explicit db_serializer(std::string_view url);
        virtual ~db_serializer();

        bool insert(std::string_view database, std::string_view collection, const json& j) const;
        bool update(std::string_view database, std::string_view collection, const json& look_alike, const json& update_info) const;

        maybe_result find_one(std::string_view database, std::string_view collection, const json& look_alike) const;
        std::vector<json> find_many(std::string_view database, std::string_view collection, const json& look_alike) const;

    private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
}