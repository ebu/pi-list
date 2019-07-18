#pragma once

#include "ebu/list/net/ipv4/address.h"
#include "ebu/list/net/socket_handle.h"
#include <map>

namespace ebu_list::ipv4
{
	class multicast_subscription
	{
	public:
		multicast_subscription(ipv4::address listen_address,
			ipv4::address multicast_address,
			port multicast_port);

	private:
		socket_handle sd_;
	};

	using multicast_subscription_uptr = std::unique_ptr<multicast_subscription>;

	class multicast_subscriber
	{
	public:
		explicit multicast_subscriber(ipv4::address listen_address);

		void subscribe_to(ipv4::address address, port port);
		void unsubscribe_from(ipv4::address address);

	private:
		const ipv4::address listen_address_;
		std::map<ipv4::address, multicast_subscription_uptr> subscriptions_;
	};
}
