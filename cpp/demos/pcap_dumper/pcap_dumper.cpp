#include "bisect/bicla.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/pcap/reader.h"
#include "ebu/list/ptp/decoder.h"
#include "ebu/list/version.h"

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

        const auto [parse_result, config] =
            parse(argc, argv, argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"));

        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    void dump_packet_info(const pcap::packet& packet, const int packet_count)
    {
        const auto ts = to_date_time_string(packet.pcap_header().timestamp());
        std::cout << "Packet #" << packet_count << ", size: 0x" << size(packet.data) << ", timestamp: " << ts << "\n";
    }

    void run(const config& config)
    {
        auto factory = std::make_shared<malloc_sbuffer_factory>();
        chunked_data_source source(factory, std::make_unique<file_source>(factory, config.pcap_file));

        auto maybe_header = pcap::read_header(source);
        if (!maybe_header)
        {
            logger()->error("Invalid file");
            return;
        }

        auto header = std::move(maybe_header.value());

        int packet_count = 0;
        for (;;)
        {
            auto maybe_packet = pcap::read_packet(header(), source);
            if (!maybe_packet) break;

            auto& packet = maybe_packet.value();
            dump_packet_info(packet, ++packet_count);

            auto [ethernet_header, ethernet_payload] = ethernet::decode(std::move(packet.data));
            std::cout << '\t' << ethernet_header << std::endl;

            // process only IPv4 packets
            if (ethernet_header.type != ethernet::payload_type::IPv4) continue;

            auto [ipv4_header, ipv4_payload] = ipv4::decode(std::move(ethernet_payload));
            std::cout << '\t' << ipv4_header << std::endl;

            // process only UDP datagrams
            if (ipv4_header.type != ipv4::protocol_type::UDP) continue;

            auto [udp_header, udp_payload] = udp::decode(std::move(ipv4_payload));
            std::cout << '\t' << udp_header << std::endl;

            (void)udp_payload;
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
    catch (std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    std::cin.ignore();

    return 0;
}
