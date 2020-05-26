#include "bisect/bicla.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/analysis/serialization/pcap.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/ptp/ptp_offset_calculator.h"
#include "ebu/list/ptp/udp_filter.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/version.h"
#include "stream_listener.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
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

    json add_ptp_info(const pcap_info& info, const std::optional<ptp::ptp_offset_calculator::info>& maybe_ptp_info)
    {
        auto j_fi = pcap_info::to_json(info);
        if(!maybe_ptp_info) return j_fi;

        const auto& ptp_info = *maybe_ptp_info;

        j_fi["ptp"] = json::object();

        if(ptp_info.is_two_step) j_fi["ptp"]["is_two_step"] = ptp_info.is_two_step.value();
        if(ptp_info.master_id) j_fi["ptp"]["master_id"] = ptp::v2::to_string(ptp_info.master_id.value());
        if(ptp_info.grandmaster_id) j_fi["ptp"]["grandmaster_id"] = ptp::v2::to_string(ptp_info.grandmaster_id.value());
        j_fi["ptp"]["average_offset"] =
            std::chrono::duration_cast<std::chrono::nanoseconds>(ptp_info.average_offset).count();

        return j_fi;
    }

    pcap_info make_pcap_info(const path& pcap_file, const std::string& pcap_uuid)
    {
        auto info             = pcap_info{};
        info.id               = pcap_uuid;
        info.filename         = pcap_file.filename().string();
        info.analyzer_version = ebu_list::version();
        return info;
    }

    void run(const config& config)
    {
        auto fi                 = make_pcap_info(config.pcap_file, config.pcap_uuid);
        auto offset_calculator  = std::make_shared<ptp::ptp_offset_calculator>();
        const auto mongo_db_url = config.mongo_db_url.value_or(MONGO_DEFAULT_URL);

        auto create_handler = [&](rtp::packet first_packet) {
            return std::make_unique<stream_listener>(first_packet, fi.id, mongo_db_url);
        };

        auto udp_handler = std::make_shared<rtp::udp_handler>(create_handler);
        auto filter      = std::make_shared<ptp::udp_filter>(offset_calculator, udp_handler);
        auto player      = std::make_unique<pcap::pcap_player>(path(config.pcap_file), filter, on_error_exit);

        const auto start_time = std::chrono::steady_clock::now();

        auto launcher = launch(std::move(player));

        launcher.wait();

        const auto end_time        = std::chrono::steady_clock::now();
        const auto processing_time = end_time - start_time;
        const auto processing_time_ms =
            static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
        logger()->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);

        if(launcher.target().pcap_has_truncated_packets())
        {
            fi.truncated = true;
        }

        const auto ptp_info      = offset_calculator->get_info();
        fi.offset_from_ptp_clock = ptp_info.has_value() ? ptp_info->average_offset : std::chrono::seconds{0};

        const auto j_fi = add_ptp_info(fi, ptp_info);

        db_serializer db(mongo_db_url);

        if(db.find_one(constants::db::offline, constants::db::collections::pcaps,
                       nlohmann::json{{"id", config.pcap_uuid}}))
        {

            db.update(constants::db::offline, constants::db::collections::pcaps,
                      nlohmann::json{{"id", config.pcap_uuid}}, j_fi);
        }
        else
        {
            db.insert(constants::db::offline, constants::db::collections::pcaps, j_fi);
        }
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
        run(config);
    }
    catch(std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
