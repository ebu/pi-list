#include "ebu/list/version.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/core/platform/parallel.h"
#include "bisect/bicla.h"
#include "ebu/list/net/udp/filter.h"
#include "ebu/list/rtp/udp_handler.h"
#include "udp_sender.h"

using namespace ebu_list;

namespace
{
    struct config
    {
        std::string pcap_file;
        std::string wanted_addr;
        uint16_t wanted_port;
        std::optional<std::string> dest_addr;
        std::optional<uint16_t> dest_port;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto[parse_result, config] = parse(argc, argv,
            argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"),
            argument(&config::wanted_addr, "wanted address", "the address of the wanted stream to replicate"),
            argument(&config::wanted_port, "wanted stream", "the port of the wanted stream to replicate"),
            argument(&config::dest_addr, "destination ip", "the ip to replicate the packets. Default: 127.0.0.1"),
            argument(&config::dest_port, "destination port", "the port to replicate the packets. Defaulf: keep original")
        );

        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    void run(const config& config)
    {
        auto sender = std::make_shared<udp_sender>(config.dest_addr.value_or("127.0.0.1"), config.dest_port);

        const auto wanted_address = ipv4::from_dotted_string(config.wanted_addr);
        const auto wanted_port = to_port(config.wanted_port);

        auto handler = std::make_shared<udp::udp_filter>(sender, wanted_address, wanted_port);
        auto player = std::make_unique<pcap::pcap_player>(path(config.pcap_file), handler);
        auto launcher = launch(std::move(player));

        launcher.wait();
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