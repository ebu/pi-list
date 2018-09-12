#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/core/platform/guid.h"
#include "nlohmann/json.hpp"

namespace ebu_list
{
    struct pcap_info
    {
        std::string id = newGuid().str();
        std::string filename;
        std::string pcap_file_name;
        std::chrono::system_clock::time_point date = std::chrono::system_clock::now();
        bool analyzed = false;
        bool truncated = false; // True iff the pcap file only has partial packets
        clock::duration offset_from_ptp_clock = {};

        // statistics
        int total_streams = 0;
        int audio_streams = 0;
        int video_streams = 0;
        int anc_streams = 0;

        int wide_streams = 0;
        int narrow_streams = 0;
        int narrow_linear_streams = 0;
        int not_compliant_streams = 0;

        /** serialization details **/
        static pcap_info from_json(const nlohmann::json& j);
        static nlohmann::json to_json(const pcap_info& info);
    };
}
