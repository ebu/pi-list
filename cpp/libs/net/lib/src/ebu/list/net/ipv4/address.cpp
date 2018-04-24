#include "ebu/list/net/ipv4/address.h"
#include "ebu/list/core/platform/config.h"
#include "ebu/list/core/idioms.h"

#if defined(_WIN32)
#include <WinSock2.h>
#include <Ws2tcpip.h>
#pragma comment(lib, "Ws2_32.lib")
#else
#include <sys/types.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#endif


using namespace ebu_list::ipv4;
using namespace ebu_list;

//------------------------------------------------------------------------------

bool ipv4::operator<(const endpoint& lhs, const endpoint& rhs)
{
    return std::tie(lhs.addr, lhs.p) < std::tie(rhs.addr, rhs.p);
}

bool ipv4::operator==(const endpoint& lhs, const endpoint& rhs)
{
    return lhs.addr == rhs.addr && lhs.p == rhs.p;
}

bool ipv4::operator!=(const endpoint& lhs, const endpoint& rhs)
{
    return !(rhs == lhs);
}

address ipv4::from_dotted_string(std::string_view s)
{
    address a;
#if defined(LIST_HAS_POSIX)
    const auto result = inet_pton(AF_INET, s.data(), &a);
#else // defined(LIST_HAS_POSIX)
    const auto result = InetPton(AF_INET, s.data(), &a);
#endif // defined(LIST_HAS_POSIX)
    if(result == 1) return a;
    if (result == 0) throw std::logic_error(fmt::format("invalid IPv4 dotted string {}", s.data()));
    throw std::runtime_error("error converting dotted string to IPv4 address");
}

std::string ipv4::to_string(const address& a)
{
    const int n0 = (static_cast<uint32_t>(a) >> 24) & 0xFF;
    const int n1 = (static_cast<uint32_t>(a) >> 16) & 0xFF;
    const int n2 = (static_cast<uint32_t>(a) >> 8) & 0xFF;
    const int n3 = static_cast<uint32_t>(a) & 0xFF;

    return fmt::format("{:d}.{:d}.{:d}.{:d}", n3, n2, n1, n0);
}

std::ostream& ipv4::operator<<(std::ostream& os, address a)
{
    os << to_string(a);
    return os;
}

std::string ipv4::to_string(const endpoint& e)
{
    return to_string(e.addr) + ":" + to_string(e.p);
}

std::ostream& ipv4::operator<<(std::ostream& os, endpoint e)
{
    os << to_string(e);
    return os;
}

endpoint ipv4::from_string(std::string_view address, std::string_view port)
{
    return from_string(address, static_cast<uint16_t>(std::stoi(std::string(port))));
}

endpoint ipv4::from_string(std::string_view address, uint16_t port)
{
    return { from_dotted_string(address), to_port(port) };
}
