#include "bisect/bicla.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/pcap/reader.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/st2110/d20/header.h"
#include "ebu/list/version.h"

using namespace ebu_list;
using namespace ebu_list::st2110;
//------------------------------------------------------------------------------

namespace
{
    using outputter = std::function<void(uint64_t ts_ns, uint32_t ext_seq_no)>;

    struct config
    {
        std::string pcap_file;
        std::optional<std::string> destination_address_s;
        std::optional<int> destination_port_i;
        std::optional<path> output_file;

        std::optional<ipv4::address> destination_address;
        std::optional<port> destination_port;

        outputter output;
    };

    outputter get_output(std::optional<path> output_file)
    {
        if(!output_file)
        {
            return [](uint64_t ts_ns, uint32_t ext_seq_no) { fmt::print("{}\t{}\n", ext_seq_no, ts_ns); };
        }

        auto file = std::make_shared<ebu_list::file_handle>(*output_file, ebu_list::file_handle::mode::write);

        return [f = std::move(file)](uint64_t ts_ns, uint32_t ext_seq_no) {
            auto s       = fmt::format("{}\t{}\n", ext_seq_no, ts_ns);
            const auto b = reinterpret_cast<const byte*>(s.data());
            cbyte_span data(b, s.length());
            write(*f, data);
        };
    }

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        auto [parse_result, config] =
            parse(argc, argv, argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"),
                  option(&config::destination_address_s, "a", "destination address",
                         "only dump packets with this destination address"),
                  option(&config::destination_port_i, "p", "destination port",
                         "only dump packets with this destination port"),
                  option(&config::output_file, "f", "output file", "file to write the output to"));

        if(!parse_result)
        {
            logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
            exit(-1);
        }

        if(config.destination_address_s)
        {
            config.destination_address = ipv4::from_dotted_string(*config.destination_address_s);
        }

        if(config.destination_port_i)
        {
            // TODO: make a port from string function that returns an optional
            config.destination_port = to_port(static_cast<uint16_t>(*config.destination_port_i));
        }

        config.output = get_output(config.output_file);

        return config;
    }

    // void dump_packet_info(const pcap::packet& /*packet*/, const int /*packet_count*/)
    // {
    //     //const auto ts = to_date_time_string(packet.pcap_header().timestamp());
    //     //std::cout << "Packet #" << packet_count << ", size: 0x" << size(packet.data) << ", timestamp: " << ts <<
    //     "\n";
    // }

    void run(const config& config)
    {
        auto factory = std::make_shared<malloc_sbuffer_factory>();
        chunked_data_source source(factory, std::make_unique<file_source>(factory, config.pcap_file));

        auto maybe_header = pcap::read_header(source);
        if(!maybe_header)
        {
            logger()->error("Invalid file");
            return;
        }

        auto header = std::move(maybe_header.value());

        // int packet_count = 0;
        for(;;)
        {
            auto maybe_packet = pcap::read_packet(header(), source);
            if(!maybe_packet) break;

            auto& packet = maybe_packet.value();
            // dump_packet_info(packet, ++packet_count);

            auto [ethernet_header, ethernet_payload] = ethernet::decode(std::move(packet.data));
            // std::cout << '\t' << ethernet_header << std::endl;

            // process only IPv4 packets
            if(ethernet_header.type != ethernet::payload_type::IPv4) continue;

            auto [ipv4_header, ipv4_payload] = ipv4::decode(std::move(ethernet_payload));
            // std::cout << '\t' << ipv4_header << std::endl;

            if(config.destination_address)
            {
                if(ipv4_header.destination_address != *config.destination_address) continue;
            }

            // process only UDP datagrams
            if(ipv4_header.type != ipv4::protocol_type::UDP) continue;

            auto [udp_header, udp_payload] = udp::decode(std::move(ipv4_payload));
            // std::cout << '\t' << udp_header << std::endl;

            if(config.destination_port)
            {
                if(udp_header.destination_port != *config.destination_port) continue;
            }

            ipv4::packet_info ipv4_info{ipv4_header, packet.pcap_header().timestamp()};
            auto datagram = udp::make_datagram(ethernet_header.source_address, ethernet_header.destination_address,
                                               ethernet_header.type, ipv4_info, udp_header.source_port,
                                               udp_header.destination_port, std::move(udp_payload));

            auto maybe_rtp_packet = rtp::decode(datagram.ethernet_info, datagram.info, std::move(datagram.sdu));
            if(!maybe_rtp_packet)
            {
                continue;
            }

            auto rtp_packet = std::move(maybe_rtp_packet.value());

            auto& sdu = rtp_packet.sdu;

            constexpr auto minimum_size =
                ssizeof<d20::raw_extended_sequence_number>() + ssizeof<d20::raw_line_header>();
            if(sdu.view().size() < minimum_size) continue;

            auto p = sdu.view().data();

            const auto extended_sequence_number =
                to_native(reinterpret_cast<const d20::raw_extended_sequence_number*>(p)->esn);
            const uint32_t full_sequence_number =
                (extended_sequence_number << 16) | rtp_packet.info.rtp.view().sequence_number();

            const auto ts_ns = packet.pcap_header.view().timestamp().time_since_epoch().count();
            config.output(ts_ns, full_sequence_number);
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
    catch(...)
    {
        console->error("unknown exception");
        return -1;
    }

    // std::cin.ignore();

    return 0;
}
