#pragma once

#include "ebu/list/net/udp/sender.h"
#include "ebu/list/net/udp/listener.h"
#include <optional>

namespace ebu_list
{
    class udp_sender : public udp::listener
    {
    public:
        udp_sender(ipv4::address address, std::optional<port> port);
        udp_sender(const std::string& address, std::optional<uint16_t> p);

        void on_data(udp::datagram&& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;

    private:
        udp::sender udp_sender_;

        ipv4::address address_;
        std::optional<port> port_;

        std::vector<udp::datagram> datagrams_;
    };
}