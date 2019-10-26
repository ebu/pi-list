#pragma once

#include "ebu/list/net/udp/listener.h"

namespace ebu_list::udp
{
    // todo: error handling

    class receiver
    {
      public:
        receiver(listener_uptr l, const std::string& address, uint16_t port);
        receiver(listener_uptr l, ipv4::address dest_addr, port dest_port);
        virtual ~receiver();

        void stop();

      private:
        struct impl;
        std::unique_ptr<impl> pimpl_;
    };

    using receiver_uptr = std::unique_ptr<receiver>;
} // namespace ebu_list::udp
