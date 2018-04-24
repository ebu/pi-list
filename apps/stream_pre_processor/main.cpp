#include "pch.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/serialization/utils.h"
#include "ebu/list/version.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/serialization/pcap.h"
#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/ptp/udp_filter.h"
#include "bisect/bicla.h"
#include "stream_listener.h"
#include "ptp_offset_calculator.h"

using namespace ebu_list;

namespace
{
    struct config
    {
        path pcap_file;
        path base_dir;
        std::string pcap_uuid;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto[parse_result, config] = parse(argc, argv,
            argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"),
            argument(&config::base_dir, "base dir", "the path to the base directory where to write the information"),
            argument(&config::pcap_uuid, "pcap uuid", "the identifier that will be used as the name of the directory and the id of the pcap file")
            );

        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    pcap_info make_pcap_info(const path& pcap_file, const std::string& pcap_uuid)
    {
        auto info = pcap_info{};
        info.id = pcap_uuid;
        info.filename = pcap_file.filename().string();
        return info;
    }

    void run(const config& config)
    {
        auto fi = make_pcap_info(config.pcap_file, config.pcap_uuid);
        auto offset_calculator = std::make_shared<ptp_offset_calculator>();
        const auto offset_calculator_p = offset_calculator.get();

        auto create_handler = [&](rtp::packet first_packet)
        {
            return std::make_unique<stream_listener>(first_packet, config.base_dir, fi.id);
        };

        auto ptp_sm = std::make_shared<ptp::state_machine>(offset_calculator);
        auto udp_handler = std::make_shared<rtp::udp_handler>(create_handler);
        auto filter = std::make_shared<ptp::udp_filter>(ptp_sm, udp_handler);
        auto player = std::make_unique<pcap::pcap_player>(path(config.pcap_file), filter);

        const auto start_time = std::chrono::steady_clock::now();

        auto launcher = launch(std::move(player));

        launcher.wait();

        const auto end_time = std::chrono::steady_clock::now();
        const auto processing_time = end_time - start_time;
        const auto processing_time_ms = static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
        logger()->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);

        fi.offset_from_ptp_clock = offset_calculator_p->get_average_offset();
        write_pcap_info(config.base_dir, fi);

        logger()->info("----------------------------------------");
        logger()->info("PTP average offset: {} ns", offset_calculator_p->get_average_offset().count());
        logger()->info("Wrote all information to: {}", (config.base_dir/fi.id).string());
    }
}

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
    catch (std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
