#include "ebu/list/net/utils.h"
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
#include <ifaddrs.h>
#endif // defined(LIST_HAS_POSIX)

using namespace ebu_list;

//------------------------------------------------------------------------------

std::optional<ipv4::address> net::get_ipv4_interface_addr(std::string_view interface_name)
{
#if defined(LIST_HAS_POSIX)
    
    struct ifaddrs* ifaddr;
    const auto getifaddrs_result = getifaddrs(&ifaddr);
    LIST_ENFORCE(getifaddrs_result != -1, std::runtime_error, "Error calling getifaddrs");

    scope_guard cleanup([ifaddr]() {
        ::freeifaddrs(ifaddr);
    });

    for (auto i = ifaddr; i != nullptr; i = i->ifa_next)
    {
        if (i->ifa_addr 
            && i->ifa_addr->sa_family == AF_INET
            && interface_name.compare(i->ifa_name) == 0)
        {
            const auto a = reinterpret_cast<const sockaddr_in*>(i->ifa_addr);
            return static_cast<ipv4::address>(a->sin_addr.s_addr);
        }
    }

    return std::nullopt;
#else// defined(LIST_HAS_POSIX)

    interface_name;
    throw std::runtime_error("get_ipv4_interface_addr not implemented");

#endif // defined(LIST_HAS_POSIX)
}
