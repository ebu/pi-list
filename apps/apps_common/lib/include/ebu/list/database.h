#pragma once

#include "nlohmann/json.hpp"
#include <memory>
#include <optional>

namespace ebu_list
{
    using json         = nlohmann::json;
    using maybe_result = std::optional<json>;

    class db_serializer
    {
      public:
        db_serializer(std::string storage_mode, std::string_view url, std::string pcaps_json_filename,
                      std::string streams_json_filename);
        virtual ~db_serializer();

        bool insert(std::string_view database, std::string_view collection, const json& j) const;
        bool insert_or_update(std::string_view database, std::string_view collection, const json& look_alike,
                              const json& update_info) const;
        bool update(std::string_view database, std::string_view collection, const json& look_alike,
                    const json& update_info) const;

        maybe_result find_one(std::string_view database, std::string_view collection, const json& look_alike) const;
        std::vector<json> find_many(std::string_view database, std::string_view collection,
                                    const json& look_alike) const;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list
