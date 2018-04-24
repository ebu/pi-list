#include "ebu/list/core/types.h"
#include "ebu/list/core/idioms.h"

#if defined(LIST_HAS_WIN32)
#include <intrin.h>
#endif // defined(LIST_HAS_WIN32)

#if defined(LIST_HAS_POSIX)
#include <byteswap.h>
#endif // defined(LIST_HAS_POSIX)

using namespace ebu_list;

//------------------------------------------------------------------------------

std::string ebu_list::to_string(const port& p)
{
    return std::to_string(to_native(p));
}

std::ostream& ebu_list::operator<<(std::ostream& os, port p)
{
    os << to_string(p);
    return os;
}

//------------------------------------------------------------------------------

#if defined(LIST_HAS_WIN32)
uint16_t ebu_list::to_native(net_uint16_t v)
{
    return _byteswap_ushort(static_cast<uint16_t>(v));
}

uint32_t ebu_list::to_native(net_uint32_t v)
{
    return _byteswap_ulong(static_cast<uint32_t>(v));
}

uint64_t ebu_list::to_native(net_uint64_t v)
{
    return _byteswap_uint64(static_cast<uint64_t>(v));
}

net_uint16_t ebu_list::to_net(uint16_t v)
{
    return net_uint16_t{ _byteswap_ushort(v) };
}

net_uint32_t ebu_list::to_net(uint32_t v)
{
    return net_uint32_t{ _byteswap_ulong(v) };
}

net_uint64_t ebu_list::to_net(uint64_t v)
{
    return net_uint64_t{ _byteswap_uint64(v) };
}
#endif

#if defined(LIST_HAS_POSIX)
uint16_t ebu_list::to_native(net_uint16_t v)
{
    return bswap_16(static_cast<uint16_t>(v));
}

uint32_t ebu_list::to_native(net_uint32_t v)
{
    return bswap_32(static_cast<uint32_t>(v));
}

uint64_t ebu_list::to_native(net_uint64_t v)
{
    return bswap_64(static_cast<uint64_t>(v));
}

net_uint16_t ebu_list::to_net(uint16_t v)
{
    return net_uint16_t{ bswap_16(v) };
}

net_uint32_t ebu_list::to_net(uint32_t v)
{
    return net_uint32_t{ bswap_32(v) };
}

net_uint64_t ebu_list::to_net(uint64_t v)
{
    return net_uint64_t{ bswap_64(v) };
}
#endif // defined(LIST_HAS_POSIX)
