#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/core/platform/guid.h"

namespace ebu_list
{
    struct pcap_info
    {
        std::string id = newGuid().str();
        std::string filename;
        std::string pcap_file_name;
        std::chrono::system_clock::time_point date = std::chrono::system_clock::now();
        bool analyzed = false;
        clock::duration offset_from_ptp_clock = {};

        // statistics
        int total_streams = 0;
        int audio_streams = 0;
        int video_streams = 0;
        int anc_streams = 0;
    };

    pcap_info read_pcap_from_json(const path& json_file);
    void write_pcap_info(const path &base_dir, const pcap_info &info);
}
