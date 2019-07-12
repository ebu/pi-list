#include "ebu/list/net/ipv4/multicast.h"

#include "ebu/list/core/idioms.h"
#if defined(LIST_HAS_POSIX)
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/ioctl.h>
#include <netinet/in.h>
#include <net/if.h>
#include <arpa/inet.h>
#elif defined(LIST_HAS_WIN32)
#include <ws2ipdef.h>
#endif

using namespace ebu_list::ipv4;
using namespace ebu_list;

//------------------------------------------------------------------------------


void ipv4::join_multicast_group(socket_handle& sock,
    ipv4::address listen_address,
    ipv4::endpoint multicast_endpoint)
{
    // Enable SO_REUSEADDR to allow multiple applications to receive copies of the multicast datagrams.
    int reuse = 1;
    const auto setsockopt_result = setsockopt(sock.get_handle(), SOL_SOCKET, SO_REUSEADDR, reinterpret_cast<const char *>(&reuse), sizeof(reuse));
    LIST_ENFORCE(setsockopt_result >= 0, std::runtime_error, "Error setting SO_REUSEADDR");

    // Bind to the proper port number with the IP address specified as INADDR_ANY.
    struct sockaddr_in localSockAddr;
    memset(reinterpret_cast<char *>(&localSockAddr), 0, sizeof(localSockAddr));
    localSockAddr.sin_family = AF_INET;
    localSockAddr.sin_port = static_cast<uint16_t>(multicast_endpoint.p);
    localSockAddr.sin_addr.s_addr = INADDR_ANY;
    const auto bind_result = bind(sock.get_handle(), reinterpret_cast<struct sockaddr *>(&localSockAddr), sizeof(localSockAddr));
    LIST_ENFORCE(bind_result >= 0, std::runtime_error, "Error binding datagram socket");

    struct ip_mreq group;
    group.imr_multiaddr.s_addr = static_cast<uint32_t>(multicast_endpoint.addr);
    group.imr_interface.s_addr = static_cast<uint32_t>(listen_address);
    const auto add_mc_result = setsockopt(sock.get_handle(), IPPROTO_IP, IP_ADD_MEMBERSHIP, reinterpret_cast<const char *>(&group), sizeof(group));
    LIST_ENFORCE(add_mc_result >= 0, std::runtime_error, "Error adding multicast group");
    logger()->info("Reporting to multicast group {}.\n", to_string(multicast_endpoint.addr));
}
