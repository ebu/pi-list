#include "ebu/list/net/ipv4/multicast_subscriber.h"
#include "ebu/list/net/ipv4/multicast.h"
#include "ebu/list/core/io/logger.h"
#include "ebu/list/core/idioms.h"

#include <sys/socket.h>

using namespace ebu_list::ipv4;
using namespace ebu_list;

//------------------------------------------------------------------------------

multicast_subscription::multicast_subscription(const ipv4::address listen_address,
    ipv4::address multicast_address,
    port multicast_port)
	: sd_(AF_INET, SOCK_DGRAM, 0)
{
    LIST_ENFORCE(sd_.is_valid(), std::runtime_error, "Error creating socket");

    join_multicast_group(sd_, listen_address, ipv4::endpoint {multicast_address, multicast_port});
}

//------------------------------------------------------------------------------

multicast_subscriber::multicast_subscriber(ipv4::address listen_address)
    : listen_address_(listen_address)
{
}

void multicast_subscriber::subscribe_to(ipv4::address address, port port)
{
    logger()->info("Subscribing to {}:{}\n", to_string(address), to_string(port));

    // TODO: implement the socket's move constructor so that we can create it on the stack
    auto subscription = std::make_unique<multicast_subscription>(listen_address_,
        address,
        port);

    subscriptions_.emplace(address, std::move(subscription));
}

void multicast_subscriber::unsubscribe_from(ipv4::address address)
{
    logger()->info("Unsubscribing from {}\n", to_string(address));

    const auto it = subscriptions_.find(address);
    if(it != subscriptions_.end())
    {
        subscriptions_.erase(it);
    }
}
