// Lists all streams contained in a .pcap file.

#include "bisect/bicla.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/net/udp/listener.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/pcap/reader.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/st2110/d20/header.h"
#include "ebu/list/st2110/d20/packet.h"
#include "ebu/list/version.h"
#include "stream_handler.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

namespace
{
    struct config
    {
        path pcap_file;
        std::optional<bool> verbose = false;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto [parse_result, config] =
            parse(argc, argv, argument(&config::pcap_file, "pcap file", "the path to the pcap file to use as input"),
                  option(&config::verbose, "v", "verbose", "verbose output"));

        if(parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    using stream_handlers = std::vector<const stream_handler*>;

    template <typename T> void dump_histogram(const typename histogram_data<T>::entries& entries)
    {
        for(const auto& e : entries)
        {
            logger()->info("{:>8d}: {:>8d} ({:>3.2f}%)", e.value, e.count, e.relative * 100);
        }
    }

    void dump_handler(const stream_handler& handler)
    {
        logger()->info("----------------------------------------");
        logger()->info("*** Stream to: {}", to_string(handler.info().destination));
        logger()->info("- payload type: 0x{:02x}", handler.info().payload_type);
        logger()->info("- packet count: {:d}", handler.info().packet_count);
        logger()->info("- packet sizes:");
        dump_histogram<size_t>(handler.info().packet_sizes);
        logger()->info("- timestamp deltas:");
        dump_histogram<int>(handler.info().ts_deltas);
        logger()->info("- calculated rate: {:03.2f} Hz", handler.info().rate);
    }

    void dump_handlers(const stream_handlers& streams)
    {
        for(auto& stream : streams)
        {
            dump_handler(*stream);
        }
    }

    void run(const config& config)
    {
        stream_handlers streams;

        auto create_handler = [&](rtp::packet first_packet) {
            auto new_handler = std::make_unique<stream_handler>(first_packet);
            streams.push_back(new_handler.get());
            return new_handler;
        };

        auto handler = std::make_shared<rtp::udp_handler>(create_handler);
        auto player  = std::make_unique<pcap::pcap_player>(path(config.pcap_file), handler, on_error_exit);

        auto launcher = launch(std::move(player));

        std::thread t([&]() {
            logger()->info("Press <enter> to exit.\n\n");
            std::cin.ignore();
            launcher.stop();
        });

        launcher.wait();

        dump_handlers(streams);

        t.join();
    }
} // namespace

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    auto console = logger();
    console->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    console->set_level(config.verbose.value() ? spdlog::level::trace : spdlog::level::info);

    try
    {
        run(config);
    }
    catch(std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
