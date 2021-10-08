#include "ebu/list/database.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/core/idioms.h"

#include "bsoncxx/builder/stream/document.hpp"
#include "bsoncxx/json.hpp"
#include "bsoncxx/types/value.hpp"
#include "mongocxx/client.hpp"
#include "mongocxx/instance.hpp"
#include "mongocxx/uri.hpp"
#include "nlohmann/json.hpp"

#include <fstream>

using namespace ebu_list;
using namespace ebu_list::analysis;
using json = nlohmann::json;

namespace
{
    json from_bson_to_json(bsoncxx::document::view b) { return json::parse(bsoncxx::to_json(b)); }

    bsoncxx::document::value from_json_to_bson(const json& j) { return bsoncxx::from_json(j.dump()); }
} // namespace

struct db_serializer::impl
{
    mongocxx::client client_;

    impl(std::string_view url)
    {
        static const mongocxx::instance instance; // This should be done only once.

        client_ = mongocxx::client{mongocxx::uri{url.data()}};
        LIST_ENFORCE(client_, std::runtime_error, "mongoDB client is not valid");
    }

    bool insert_or_update_impl(std::string_view database, std::string_view collection, const json& look_alike,
                               const json& update_info, bool upsert)
    {
        using namespace bsoncxx::builder;

        mongocxx::database db     = client_[database.data()];
        mongocxx::collection coll = db[collection.data()];

        auto to_be_updated = from_json_to_bson(update_info);
        auto doc = stream::document{} << "$set" << bsoncxx::types::b_document{to_be_updated.view()} << stream::finalize;
        auto filter = from_json_to_bson(look_alike);

        coll.update_one(std::move(filter), std::move(doc), mongocxx::options::update().upsert(upsert));

        return true;
    }
};

db_serializer::db_serializer(std::string_view url) : impl_(std::make_unique<impl>(url))
{
}

std::optional<nlohmann::json> ebu_list::db_serializer::find_one(std::string_view database, std::string_view collection,
                                                                const json& look_alike) const
{
    mongocxx::database db     = impl_->client_[database.data()];
    mongocxx::collection coll = db[collection.data()];

    auto filter     = from_json_to_bson(look_alike);
    auto maybe_bson = coll.find_one(std::move(filter));

    if(maybe_bson)
        return from_bson_to_json(maybe_bson.value());
    else
        return std::nullopt;
}

ebu_list::db_serializer::~db_serializer()
{
}

bool ebu_list::db_serializer::insert(std::string_view database, std::string_view collection, const json& j) const
{
    mongocxx::database db     = impl_->client_[database.data()];
    mongocxx::collection coll = db[collection.data()];

    auto doc = from_json_to_bson(j);
    coll.insert_one(std::move(doc)); // todo: double-check result

    return true;
}

bool ebu_list::db_serializer::update(std::string_view database, std::string_view collection, const json& look_alike,
                                     const json& update_info) const
{
    return impl_->insert_or_update_impl(database, collection, look_alike, update_info, false);
}

std::vector<json> ebu_list::db_serializer::find_many(std::string_view database, std::string_view collection,
                                                     const json& look_alike) const
{
    std::vector<json> jsons{};

    mongocxx::database db     = impl_->client_[database.data()];
    mongocxx::collection coll = db[collection.data()];

    auto filter  = from_json_to_bson(look_alike);
    auto results = coll.find(std::move(filter));

    for(auto doc : results)
        jsons.push_back(from_bson_to_json(doc));

    return jsons;
}

bool ebu_list::db_serializer::insert_or_update(std::string_view database, std::string_view collection,
                                               const json& look_alike, const json& update_info) const
{
    return impl_->insert_or_update_impl(database, collection, look_alike, update_info, true);
}
