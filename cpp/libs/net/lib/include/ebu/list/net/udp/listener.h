#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/decoder.h"
#include <memory>

namespace ebu_list::udp
{
    class listener
    {
    public:
        virtual ~listener() = default;

        virtual void on_data(datagram&& datagram) = 0;
        virtual void on_complete() = 0;
        virtual void on_error(std::exception_ptr) = 0;
    };

    using listener_ptr = std::shared_ptr<listener>;
    using listener_uptr = std::unique_ptr<listener>;
}
