#pragma once

#include "ebu/list/net/udp/listener.h"
#include "ebu/list/rtp/listener.h"
#include <set>
#include <map>

namespace ebu_list::rtp
{
    class udp_handler : public udp::listener
    {
    public:
        using handler_creator = std::function<rtp::listener_uptr(rtp::packet first_packet)>;

        explicit udp_handler(handler_creator creator);

#pragma region udp::listener events
        void on_data(udp::datagram&& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

    private:
        rtp::listener* find_or_create(const rtp::packet& packet);

    private:
        handler_creator creator_;

        // destination endpoint
        using handler_map = std::map<ipv4::endpoint, rtp::listener_uptr>;
        handler_map handlers_;
    };
}