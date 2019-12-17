#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/net/ipv4/address.h"
#include <memory>

namespace ebu_list::udp
{
    class sender
    {
      public:
        sender();
        virtual ~sender();

        void send_data(cbyte_span msg, const ipv4::endpoint& endpoint);
        void send_data(cbyte_span msg, const std::string& address, const std::string& port);

      private:
        struct impl;
        std::unique_ptr<impl> pimpl_;
    };
} // namespace ebu_list::udp