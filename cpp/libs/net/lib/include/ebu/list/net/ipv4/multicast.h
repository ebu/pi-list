#pragma once

#include "ebu/list/net/ipv4/address.h"
#include "ebu/list/net/socket_handle.h"

namespace ebu_list::ipv4
{
	void join_multicast_group(socket_handle& sock, ipv4::address listen_address,
		ipv4::endpoint multicast_endpoint);
}
