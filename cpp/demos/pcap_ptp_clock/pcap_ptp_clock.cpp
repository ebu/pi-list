#include "pch.h"
#include "ebu/list/ptp/state_machine.h"
#include "ebu/list/ptp/udp_filter.h"
#include "ebu/list/version.h"
#include "ebu/list/net/udp/listener.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/pcap/reader.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/net/udp/listener.h"
#include "bisect/bicla.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

namespace
{
    struct config
    {
        std::string pcap_file;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto[parse_result, config] = parse(argc, argv,
            argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"));
        
        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }
}

//------------------------------------------------------------------------------
class null_udp_listener : public udp::listener
{
private:
#pragma region udp::listener events
    void on_data(udp::datagram&&) override
    {
    }

    void on_complete() override
    {
    }

    void on_error(std::exception_ptr) override
    {
    }
#pragma endregion udp::listener events
};

//------------------------------------------------------------------------------

void run(const config& config)
{
    logger()->info("Press <enter> to exit.\n\n");

    auto sm = std::make_shared<ptp::state_machine>();
    auto non_ptp_listener = std::make_shared<null_udp_listener>();
    auto filter = std::make_shared<ptp::udp_filter>(sm, non_ptp_listener);
    auto player = std::make_unique<pcap::pcap_player>(path(config.pcap_file), filter);
    auto launcher = launch(std::move(player));

    std::cin.ignore();

    launcher.stop();
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

    std::cin.ignore();

    return 0;
}

