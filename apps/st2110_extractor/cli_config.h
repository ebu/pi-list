#pragma once

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
        std::string storage_mode;
        std::optional<std::string> influxdb_url;
        std::optional<std::string> mongo_db_url;
        std::optional<std::string> pcap_metadata_file;
        std::optional<std::string> streams_metadata_file;
        std::optional<std::string> id_to_process;
    };
} // namespace ebu_list::st2110_extractor
