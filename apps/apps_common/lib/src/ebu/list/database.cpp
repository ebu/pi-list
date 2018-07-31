#include "ebu/list/core/idioms.h"
#include "ebu/list/database.h"

#include "mongocxx/client.hpp"
#include "mongocxx/stdx.hpp"
#include "mongocxx/uri.hpp"
#include "mongocxx/instance.hpp"
#include "bsoncxx/json.hpp"
#include "bsoncxx/builder/stream/document.hpp"
#include "bsoncxx/types/value.hpp"
#include "nlohmann/json.hpp"

using namespace ebu_list;

namespace
{
    json from_bson_to_json(bsoncxx::document::view b)
    {
        return json::parse(bsoncxx::to_json(b));
    }

    bsoncxx::document::value from_json_to_bson(const json& j)
    {
        return bsoncxx::from_json(j.dump());
    }
}

struct db_serializer::impl
{
    mongocxx::client client_;

    explicit impl(std::string_view url)
    {
        static const mongocxx::instance instance; // This should be done only once.

        client_ = mongocxx::client{mongocxx::uri{url}};
        LIST_ENFORCE( client_, std::runtime_error, "mongoDB client is not valid" );
    }

    bool insert_or_update_impl(std::string_view database, std::string_view collection, const json& look_alike, const json& update_info, bool upsert)
    {
        using namespace bsoncxx::builder;

        mongocxx::database db = client_[database];
        mongocxx::collection coll = db[collection];

        auto to_be_updated = from_json_to_bson(update_info);
        auto doc = stream::document{} << "$set" << bsoncxx::types::b_document{to_be_updated.view()} << stream::finalize;
        auto filter = from_json_to_bson(look_alike);

        coll.update_one(std::move(filter), std::move(doc), mongocxx::options::update().upsert(upsert));

        return true;
    }
};

db_serializer::db_serializer(std::string_view url)
    : impl_(std::make_unique<impl>(url))
{
}

maybe_result ebu_list::db_serializer::find_one(std::string_view database, std::string_view collection, const json& look_alike) const
{
    mongocxx::database db = impl_->client_[database];
    mongocxx::collection coll = db[collection];

    auto filter = from_json_to_bson(look_alike);
    auto maybe_bson = coll.find_one(std::move(filter));

    if( maybe_bson )
    {
        return from_bson_to_json(maybe_bson.value());
    }
    else
    {
        return {};
    }
}

ebu_list::db_serializer::~db_serializer()
{
}

bool ebu_list::db_serializer::insert(std::string_view database, std::string_view collection, const json& j) const
{
    mongocxx::database db = impl_->client_[database];
    mongocxx::collection coll = db[collection];

    auto doc = from_json_to_bson(j);
    coll.insert_one(std::move(doc)); // todo: double-check result

    return true;
}

bool ebu_list::db_serializer::update(std::string_view database, std::string_view collection, const json& look_alike, const json& update_info) const
{
    return impl_->insert_or_update_impl(database, collection, look_alike, update_info, false);
}

std::vector<json> ebu_list::db_serializer::find_many(std::string_view database, std::string_view collection, const json& look_alike) const
{
    mongocxx::database db = impl_->client_[database];
    mongocxx::collection coll = db[collection];

    auto filter = from_json_to_bson(look_alike);
    auto results = coll.find(std::move(filter));

    std::vector<json> jsons {};
    for(auto doc : results)
    {
        jsons.push_back(from_bson_to_json(doc));
    }

    return jsons;
}

bool ebu_list::db_serializer::insert_or_update(std::string_view database, std::string_view collection, const json& look_alike, const json& update_info) const
{
    return impl_->insert_or_update_impl(database, collection, look_alike, update_info, true);
}
