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

namespace
{
    json from_bson_to_json(bsoncxx::document::view b) { return json::parse(bsoncxx::to_json(b)); }

    bsoncxx::document::value from_json_to_bson(const json& j) { return bsoncxx::from_json(j.dump()); }
} // namespace

struct db_serializer::impl
{
    std::string storage_mode_;
    mongocxx::client client_;
    std::string pcaps_json_filename_, streams_json_filename_;
    json pcaps_db_, streams_db_;

    impl(std::string storage_mode, std::string_view url, std::string pcaps_json_filename,
         std::string streams_json_filename)
        : storage_mode_(storage_mode)
    {
        if (storage_mode_ == "database")
        {
            static const mongocxx::instance instance; // This should be done only once.

            client_ = mongocxx::client{mongocxx::uri{url}};
            LIST_ENFORCE(client_, std::runtime_error, "mongoDB client is not valid");
        }
        else if (storage_mode_ == "filesystem")
        {
            pcaps_json_filename_   = pcaps_json_filename;
            streams_json_filename_ = streams_json_filename;

            std::ifstream pcaps_file(pcaps_json_filename_), streams_file(streams_json_filename_);

            pcaps_file >> pcaps_db_;
            streams_file >> streams_db_;

            pcaps_file.close();
            streams_file.close();
        }
    }

    ~impl()
    {
        if (storage_mode_ == "filesystem")
        {
            std::ofstream pcaps_file(pcaps_json_filename_), streams_file(streams_json_filename_);

            pcaps_file << pcaps_db_;
            streams_file << streams_db_;

            pcaps_file.close();
            streams_file.close();
        }
    }

    bool insert_or_update_impl(std::string_view database, std::string_view collection, const json& look_alike,
                               const json& update_info, bool upsert)
    {
        if (storage_mode_ == "database")
        {
            using namespace bsoncxx::builder;

            mongocxx::database db     = client_[database];
            mongocxx::collection coll = db[collection];

            auto to_be_updated = from_json_to_bson(update_info);
            auto doc           = stream::document{} << "$set" << bsoncxx::types::b_document{to_be_updated.view()}
                                          << stream::finalize;
            auto filter = from_json_to_bson(look_alike);

            coll.update_one(std::move(filter), std::move(doc), mongocxx::options::update().upsert(upsert));

            return true;
        }
        else if (storage_mode_ == "filesystem")
        {
            json* db = nullptr;
            if (collection == constants::db::collections::pcaps)
                db = &pcaps_db_;
            else if (collection == constants::db::collections::streams)
                db = &streams_db_;
            else
                return false;

            for (size_t i = 0; i < db->size(); ++i)
            {
                json obj = db->at(i);
                auto res = obj.find(look_alike);
                if (res != obj.end())
                {
                    *res = update_info;
                    return true;
                }
            }

            if (upsert)
            {
                db->push_back(update_info);
                return true;
            }

            return false;
        }
        else
            return false;
    }
};

db_serializer::db_serializer(std::string storage_mode, std::string_view url, std::string pcaps_json_file,
                             std::string streams_json_file)
    : impl_(std::make_unique<impl>(storage_mode, url, pcaps_json_file, streams_json_file))
{
}

maybe_result ebu_list::db_serializer::find_one(std::string_view database, std::string_view collection,
                                               const json& look_alike) const
{
    if (impl_->storage_mode_ == "database")
    {
        mongocxx::database db     = impl_->client_[database];
        mongocxx::collection coll = db[collection];

        auto filter     = from_json_to_bson(look_alike);
        auto maybe_bson = coll.find_one(std::move(filter));

        if (maybe_bson)
            return from_bson_to_json(maybe_bson.value());
        else
            return {};
    }
    else if (impl_->storage_mode_ == "filesystem")
    {
        json* db = nullptr;
        if (collection == constants::db::collections::pcaps)
            db = &impl_->pcaps_db_;
        else if (collection == constants::db::collections::streams)
            db = &impl_->streams_db_;
        else
            return {};

        for (size_t i = 0; i < db->size(); ++i)
        {
            json obj = db->at(i);
            auto res = obj.find(look_alike.begin().key());
            if (res != obj.end()) return obj;
        }

        return {};
    }
    else
        return {};
}

ebu_list::db_serializer::~db_serializer()
{
}

bool ebu_list::db_serializer::insert(std::string_view database, std::string_view collection, const json& j) const
{
    if (impl_->storage_mode_ == "database")
    {
        mongocxx::database db     = impl_->client_[database];
        mongocxx::collection coll = db[collection];

        auto doc = from_json_to_bson(j);
        coll.insert_one(std::move(doc)); // todo: double-check result

        return true;
    }
    else if (impl_->storage_mode_ == "filesystem")
    {
        json* db = nullptr;
        if (collection == constants::db::collections::pcaps)
            db = &impl_->pcaps_db_;
        else if (collection == constants::db::collections::streams)
            db = &impl_->streams_db_;
        else
            return false;

        db->push_back(j);
        return true;
    }
    else
        return false;
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

    if (impl_->storage_mode_ == "database")
    {
        mongocxx::database db     = impl_->client_[database];
        mongocxx::collection coll = db[collection];

        auto filter  = from_json_to_bson(look_alike);
        auto results = coll.find(std::move(filter));

        for (auto doc : results)
            jsons.push_back(from_bson_to_json(doc));

        return jsons;
    }
    else if (impl_->storage_mode_ == "filesystem")
    {
        json* db = nullptr;
        if (collection == constants::db::collections::pcaps)
            db = &impl_->pcaps_db_;
        else if (collection == constants::db::collections::streams)
            db = &impl_->streams_db_;
        else
            return {};

        for (size_t i = 0; i < db->size(); ++i)
        {
            json obj = db->at(i);
            auto res = obj.find(look_alike.begin().key());
            if (res != obj.end()) jsons.push_back(obj);
        }

        return jsons;
    }
    else
        return jsons;
}

bool ebu_list::db_serializer::insert_or_update(std::string_view database, std::string_view collection,
                                               const json& look_alike, const json& update_info) const
{
    return impl_->insert_or_update_impl(database, collection, look_alike, update_info, true);
}
