#pragma once

#include "nlohmann/json.hpp"
#include <memory>
#include <optional>

namespace ebu_list
{
    class db_serializer
    {
      public:
        db_serializer(std::string_view url);
        ~db_serializer();

        bool insert(std::string_view database, std::string_view collection, const nlohmann::json& j) const;
        bool insert_or_update(std::string_view database, std::string_view collection, const nlohmann::json& look_alike,
                              const nlohmann::json& update_info) const;
        bool update(std::string_view database, std::string_view collection, const nlohmann::json& look_alike,
                    const nlohmann::json& update_info) const;

        std::optional<nlohmann::json> find_one(std::string_view database, std::string_view collection,
                                               const nlohmann::json& look_alike) const;
        std::vector<nlohmann::json> find_many(std::string_view database, std::string_view collection,
                                              const nlohmann::json& look_alike) const;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list
