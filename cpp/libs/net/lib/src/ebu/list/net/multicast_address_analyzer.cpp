#include "ebu/list/net/multicast_address_analyzer.h"

#if defined(_WIN32)
#include <WinSock2.h>
#pragma comment(lib, "Ws2_32.lib")
#else
#include <arpa/inet.h>
#endif

bool ebu_list::is_multicast_address(const ethernet::mac_address& addr)
{
    const bool r = std::to_integer<uint8_t>(addr[0]) == 0x01 &&
                   std::to_integer<uint8_t>(addr[1]) == 0x00 &&
                   std::to_integer<uint8_t>(addr[2]) == 0x5E;
    return r;
}

bool ebu_list::is_multicast_address(const ipv4::address& addr)
{
    constexpr uint32_t be_multicast_mask = 0x000000F0;
    constexpr uint32_t be_multicast_value = 0x000000E0;
    const uint32_t be_addr = static_cast<uint32_t>(addr);
    const bool r = (be_addr & be_multicast_mask) == be_multicast_value;
    return r;
}

bool ebu_list::is_same_multicast_address(const ethernet::mac_address& mac_addr,
                                         const ipv4::address& ip_addr)
{
    const uint32_t be_addr = static_cast<uint32_t>(ip_addr);
    const uint32_t le_addr = ntohl(be_addr);
    const uint8_t ip_octet1 = static_cast<uint8_t>(le_addr & 0x000000FF);
    const uint8_t ip_octet2 = static_cast<uint8_t>((le_addr & 0x0000FF00) >> 8);
    const uint8_t ip_octet3 =
        static_cast<uint8_t>((le_addr & 0x00FF0000) >> 16);

    const uint8_t mac_octet1 = std::to_integer<uint8_t>(mac_addr[5]);
    const uint8_t mac_octet2 = std::to_integer<uint8_t>(mac_addr[4]);
    const uint8_t mac_octet3 = std::to_integer<uint8_t>(mac_addr[3]);

    const bool r = ip_octet1 == mac_octet1 && ip_octet2 == mac_octet2 &&
                   (ip_octet3 & 0x7) == (mac_octet3 & 0x7);
    return r;
}
