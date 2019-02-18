#include "ebu/list/version.h"
#include "ebu/list/core/types.h"
#include "ebu/list/net/ipv4/multicast_subscriber.h"
#include "bisect/bicla.h"

using namespace ebu_list;

namespace
{
	struct config
	{
		std::string local_interface_s;
		std::string multicast_group_s;
		std::optional<std::string> source_address_s;

		ipv4::address local_interface;
		ipv4::address multicast_group;
		std::optional<ipv4::address> source_address;
	};

	config parse_or_usage_and_exit(int argc, char const* const* argv)
	{
		using namespace bisect::bicla;

		auto[parse_result, config] = parse(argc, argv,
			argument(&config::local_interface_s, "local interface", "the IP address of the local interface"),
			argument(&config::multicast_group_s, "multicast group", "the multicast group to subscribe"),
			option(&config::source_address_s, "s", "source address", "if specified, will use source-specific multicast, using that source address")
		);

		if(!parse_result)
		{
			logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
			exit(-1);
		}

		config.local_interface = ipv4::from_dotted_string(config.local_interface_s);
		config.multicast_group = ipv4::from_dotted_string(config.multicast_group_s);
		if(config.source_address_s)
		{
			config.source_address = ipv4::from_dotted_string(*config.source_address_s);
		}

		return config;
	}

	void run(const config& config)
	{
		logger()->info("Subscribing to {}, using interface {}",
			to_string(config.multicast_group),
			to_string(config.local_interface));

		if(config.source_address)
		{
			logger()->info("SSM: {}",
				to_string(*config.source_address));
		}

		ipv4::multicast_subscriber subscriber(config.local_interface);
		subscriber.subscribe_to(config.multicast_group, port{});

		fmt::print("Press a key to exit\n");
		char c;
		std::cin >> c;
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
	catch(std::exception& ex)
	{
		console->error("exception: {}", ex.what());
		return -1;
	}

	return 0;
}
