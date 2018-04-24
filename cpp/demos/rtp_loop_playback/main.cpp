#include "pch.h"
#include "ebu/list/version.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/rtp/udp_handler.h"
#include "bisect/bicla.h"
#include "rtp_playback.h"

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
        const auto wanted_endpoint = ipv4::from_string(config.wanted_addr, config.wanted_port);

        auto create_handler = [&](rtp::packet first_packet) -> rtp::listener_uptr
        {
            const auto ssrc = first_packet.info.rtp.view().ssrc();
            const ipv4::endpoint packet_destination = {first_packet.info.udp.destination_address, first_packet.info.udp.destination_port};

            if( packet_destination != wanted_endpoint )
            {
                logger()->warn("Bypassing stream with ssrc: {}", ssrc);
                logger()->warn("\tdestination: {}", to_string(packet_destination));
                auto handler = std::make_unique<rtp::null_listener>();
                return handler;
            }

            const auto destination_address = ipv4::from_dotted_string(config.dest_addr.value_or("127.0.0.1"));
            const auto destination_port = config.dest_port ? to_port(config.dest_port.value()) : first_packet.info.udp.destination_port;
            const ipv4::endpoint send_to = {destination_address, destination_port};

            return std::make_unique<rtp_playback>(send_to);
        };

        auto handler = std::make_shared<rtp::udp_handler>(create_handler);
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