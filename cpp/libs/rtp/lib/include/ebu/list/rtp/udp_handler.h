#pragma once

#include "ebu/list/net/udp/listener.h"
#include "ebu/list/rtp/listener.h"
#include <map>
#include <set>

namespace ebu_list::rtp
{
    class udp_handler : public udp::listener
    {
      public:
        using handler_creator = std::function<udp::listener_uptr(const udp::datagram& datagram)>;

        explicit udp_handler(handler_creator creator);

#pragma region udp::listener events
        void on_data(const udp::datagram& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

      private:
        udp::listener* find_or_create(const udp::datagram& datagram);

        handler_creator creator_;

        // first: source;
        // second: destination;
        using stream_key  = std::pair<ipv4::endpoint, ipv4::endpoint>;
        using handler_map = std::map<stream_key, udp::listener_uptr>;
        handler_map handlers_;
    };
} // namespace ebu_list::rtp