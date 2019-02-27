#include "ebu/list/net/ipv4/multicast_subscriber.h"
#include "ebu/list/core/io/logger.h"
#include "ebu/list/core/idioms.h"

#if defined(LIST_HAS_POSIX)
#include <netinet/in.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <netinet/in.h>
#include <net/if.h>
#include <arpa/inet.h>
#endif // defined(LIST_HAS_POSIX)

using namespace ebu_list::ipv4;
using namespace ebu_list;

//------------------------------------------------------------------------------

multicast_subscription::multicast_subscription(const ipv4::address listen_address,
    ipv4::address multicast_address,
    port multicast_port)
	: sd_(AF_INET, SOCK_DGRAM, 0)
{
    LIST_ENFORCE(sd_.is_valid(), std::runtime_error, "Error creating socket");
    
    // Enable SO_REUSEADDR to allow multiple applications to receive copies of the multicast datagrams.
    int reuse = 1;
    const auto setsockopt_result = setsockopt(sd_.get_handle(), SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<const char*>(&reuse), sizeof(reuse));
    LIST_ENFORCE(setsockopt_result >= 0, std::runtime_error, "Error setting SO_REUSEADDR");
    
    // Bind to the proper port number with the IP address specified as INADDR_ANY.
    struct sockaddr_in localSockAddr;
    memset(reinterpret_cast<char*>(&localSockAddr), 0, sizeof(localSockAddr));
    localSockAddr.sin_family = AF_INET;
    localSockAddr.sin_port = static_cast<uint16_t>(multicast_port);
    localSockAddr.sin_addr.s_addr = INADDR_ANY;
    const auto bind_result = bind(sd_.get_handle(), reinterpret_cast<struct sockaddr*>(&localSockAddr), sizeof(localSockAddr));
    LIST_ENFORCE(bind_result >= 0, std::runtime_error, "Error binding datagram socket");
    
    struct ip_mreq group;
    group.imr_multiaddr.s_addr = static_cast<uint32_t>(multicast_address);
    group.imr_interface.s_addr = static_cast<uint32_t>(listen_address);
    const auto add_mc_result = setsockopt(sd_.get_handle(), IPPROTO_IP, IP_ADD_MEMBERSHIP, reinterpret_cast<const char*>(&group), sizeof(group));
    LIST_ENFORCE(add_mc_result >= 0, std::runtime_error, "Error adding multicast group");
    logger()->info("Reporting to multicast group {}.\n", to_string(multicast_address));
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
