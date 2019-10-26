#pragma once

#include "bisect/bimo/types.h"
#include "ebu/list/core/io/logger.h"
#include "ebu/list/core/platform/config.h"
#include "ebu/list/core/platform/time.h"
#include "gsl/gsl_byte"
#include "gsl/span"
#include <cinttypes>
#include <experimental/filesystem>

//------------------------------------------------------------------------------

namespace ebu_list
{
    using byte       = bisect::bimo::byte;
    using byte_span  = bisect::bimo::byte_span;
    using cbyte_span = bisect::bimo::cbyte_span;

    using bisect::bimo::to_byte_array;

    using path = std::experimental::filesystem::path;

    // network byte order
    enum class net_uint16_t : uint16_t;
    enum class net_uint32_t : uint32_t;
    enum class net_uint64_t : uint64_t;

    // utilities
    uint16_t to_native(net_uint16_t v);
    uint32_t to_native(net_uint32_t v);
    uint64_t to_native(net_uint64_t v);
    net_uint16_t to_net(uint16_t v);
    net_uint32_t to_net(uint32_t v);
    net_uint64_t to_net(uint64_t v);

    using port = net_uint16_t;

    std::string to_string(const port& m);
    std::ostream& operator<<(std::ostream& os, port a);

    inline port to_port(uint16_t p) { return to_net(p); }
} // namespace ebu_list
