#include "bisect/bicla.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/version.h"
#include "ebu/list/database.h"
#include "ebu/list/preprocessor/stream_listener.h"
#include "ebu/list/preprocessor/stream_analyzer.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::ptp;
using nlohmann::json;

namespace
{
    constexpr auto MONGO_DEFAULT_URL = "mongodb://localhost:27017";

    struct config
    {
        path pcap_file;
        std::string pcap_uuid;
        std::optional<std::string> mongo_db_url;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto [parse_result, config] =
            parse(argc, argv, argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"),
                  argument(&config::pcap_uuid, "pcap uuid",
                           "the identifier that will be used as the name of the directory and the id of the pcap file"),
                  option(&config::mongo_db_url, "mongo_url", "mongo url",
                         "url to mongoDB. Usually mongodb://localhost:27017."));

        if(parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    void save_pcap_info_on_db(db_serializer& db, std::string_view pcap_uuid, const json& info)
    {
        if(db.find_one(constants::db::offline, constants::db::collections::pcaps, nlohmann::json{{"id", pcap_uuid}}))
        {

            db.update(constants::db::offline, constants::db::collections::pcaps, nlohmann::json{{"id", pcap_uuid}},
                      info);
        }
        else
        {
            db.insert(constants::db::offline, constants::db::collections::pcaps, info);
        }
    }

    void save_stream_info_on_db(db_serializer& db, const json& info)
    {
        db.insert(constants::db::offline, constants::db::collections::streams, info);
    }

    void save_to_db(std::string_view mongo_db_url, json info)
    {
        db_serializer db(mongo_db_url);
        const auto pcap = info["pcap"];
        const auto pcap_uuid = pcap["id"].get<std::string>();
        save_pcap_info_on_db(db, pcap_uuid, pcap);

        const auto streams = info["streams"];

        std::for_each(begin(streams), end(streams), [&](const json& stream) {
          save_stream_info_on_db(db, stream);
        });
    }
} // namespace

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    auto console = logger();
    console->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    try
    {
        const auto info = analyze_stream(config.pcap_file.string(), config.pcap_uuid);
        save_to_db(config.mongo_db_url.value_or(MONGO_DEFAULT_URL), info);
    }
    catch(std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
