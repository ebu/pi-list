#include "ebu/list/net/ipv4/multicast_subscriber.h"
#include "ebu/list/core/io/logger.h"

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
{
#if defined(LIST_HAS_POSIX)
    // TODO: review this code

    struct sockaddr_in localSock;
    struct ip_mreq group;
    int datalen;
    char databuf[1024];

    sd_ = socket(AF_INET, SOCK_DGRAM, 0);

    if(sd_ < 0)
    {
        perror("Opening datagram socket error");
        exit(1);
    }
    else
    {
        // printf("Opening datagram socket....OK.\n");
    }
    
    /* Enable SO_REUSEADDR to allow multiple instances of this */
    /* application to receive copies of the multicast datagrams. */
    {
        int reuse = 1;
        if(setsockopt(sd_, SOL_SOCKET, SO_REUSEADDR, (char *)&reuse, sizeof(reuse)) < 0)
        {
            perror("Setting SO_REUSEADDR error");
            close(sd_);
            exit(1);
        }
        else
        {
            // printf("Setting SO_REUSEADDR...OK.\n");
        }
    }
    
    /* Bind to the proper port number with the IP address */
    /* specified as INADDR_ANY. */
    memset((char *) &localSock, 0, sizeof(localSock));
    localSock.sin_family = AF_INET;
    localSock.sin_port = static_cast<in_port_t>(multicast_port);
    localSock.sin_addr.s_addr = INADDR_ANY;
    if(bind(sd_, (struct sockaddr*)&localSock, sizeof(localSock)))
    {
        perror("Binding datagram socket error");
        close(sd_);
        exit(1);
    }
    else
        // printf("Binding datagram socket...OK.\n");
    
    /* Join the multicast group 226.1.1.1 on the local 203.106.93.94 */
    /* interface. Note that this IP_ADD_MEMBERSHIP option must be */
    /* called for each local interface over which the multicast */
    /* datagrams are to be received. */
    group.imr_multiaddr.s_addr = static_cast<uint32_t>(multicast_address);
    group.imr_interface.s_addr = static_cast<uint32_t>(listen_address);
    if(setsockopt(sd_, IPPROTO_IP, IP_ADD_MEMBERSHIP, (char *)&group, sizeof(group)) < 0)
    {
        perror("Adding multicast group error");
        close(sd_);
        exit(1);
    }
    else
    {
        logger()->info("Reporting to multicast group {}.\n", to_string(multicast_address));
    }
    
    /* Read from the socket. */
    datalen = sizeof(databuf);
    const auto read_result = read(sd_, databuf, datalen);
    if(read_result < 0)
    {
        perror("Reading datagram message error");
        close(sd_);
        exit(1);
    }
    else
    {
        // printf("Reading datagram message...OK.\n");
        // printf("The message from multicast server is %ld bytes long.\n", read_result);
    }

#else // defined(LIST_HAS_POSIX)

    // TODO: implement this for other platforms
    static_cast<void>(listen_address, multicast_address, multicast_port);

#endif // defined(LIST_HAS_POSIX)
}

multicast_subscription::~multicast_subscription()
{
#if defined(LIST_HAS_POSIX)
    close(sd_);
#endif // defined(LIST_HAS_POSIX)
}

//------------------------------------------------------------------------------

multicast_subscriber::multicast_subscriber(ipv4::address listen_address)
    : listen_address_(listen_address)
{
}

void multicast_subscriber::subscribe_to(ipv4::address address, port port)
{
    logger()->info("Subscribing to {}:{}\n", to_string(address), to_string(port));

    auto subscription = std::make_unique<multicast_subscription>(listen_address_,
        address,
        port);

    subscriptions_.insert({ address, std::move(subscription) });
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
