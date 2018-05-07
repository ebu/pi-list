#pragma once

#include "ebu/list/net/udp/listener.h"

namespace ebu_list::udp
{
    // todo: enable stopping the receiver
    // todo: error handling

    class receiver
    {
    public:
        receiver(listener_uptr l, const std::string& address, uint16_t port);
        receiver(listener_uptr l, ipv4::address dest_addr, port dest_port);
        virtual ~receiver();

    private:
        struct impl;
        std::unique_ptr<impl> pimpl_;
    };
}
