#include "bisect/bicla.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/types.h"
#include "ebu/list/net/ipv4/multicast_subscriber.h"
#include "ebu/list/net/utils.h"
#include "ebu/list/version.h"

using namespace ebu_list;

namespace
{
    struct config
    {
        std::string local_interface_s;
        std::vector<std::string> multicast_group_s;

        ipv4::address local_interface;
        std::vector<ipv4::address> multicast_group;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        auto [parse_result, config] =
            parse(argc, argv,
                  argument(&config::local_interface_s, "local interface", "the IP address of the local interface"),
                  option(&config::multicast_group_s, "g", "multicast group", "the multicast group to subscribe"));

        if (!parse_result)
        {
            logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
            exit(-1);
        }

        const auto maybe_local_addr = net::get_ipv4_interface_addr(config.local_interface_s.c_str());
        if (!maybe_local_addr)
        {
            logger()->error("invalid local interface: {}", config.local_interface_s);
            exit(-1);
        }

        config.local_interface = *maybe_local_addr;

        for (const auto& s : config.multicast_group_s)
        {
            config.multicast_group.push_back(ipv4::from_dotted_string(s));
        }

        return config;
    }

    void run(const config& config)
    {
        ipv4::multicast_subscriber subscriber(config.local_interface);

        for (const auto& group : config.multicast_group)
        {
            subscriber.subscribe_to(group, port{});
            logger()->info("Subscribing to {}, using interface {}", to_string(group),
                           to_string(config.local_interface));
        }

        fmt::print("Press a key to exit\n");
        char c;
        std::cin >> c;
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

    return 0;
}
