#pragma once

#include "ebu/list/net/udp/listener.h"
#include "ebu/list/ptp/decoder.h"
#include <set>

namespace ebu_list::ptp
{
    class message_listener
    {
      public:
        virtual ~message_listener() = default;

        virtual void on_data(ptp::some_message&& message) = 0;
        virtual void on_complete()                        = 0;
        virtual void on_error(std::exception_ptr e)       = 0;
    };

    using message_listener_ptr = std::shared_ptr<message_listener>;
}