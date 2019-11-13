#pragma once

#include "ebu/list/analysis/analysis_profile.h"
#include "ebu/list/core/types.h"

namespace ebu_list::st2110_extractor
{
    constexpr auto MONGO_DEFAULT_URL  = "mongodb://localhost:27017";
    constexpr auto INFLUX_DEFAULT_URL = "http://localhost:8086";

    struct config
    {
        std::string pcap_id;
        path pcap_file;
        path storage_folder;
        std::optional<std::string> influxdb_url;
        std::optional<std::string> mongo_db_url;
        path analysis_profile_file;
        analysis::analysis_profile profile;
        std::optional<std::string> id_to_process;
    };
} // namespace ebu_list::st2110_extractor
