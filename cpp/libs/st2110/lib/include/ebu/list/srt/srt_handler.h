#pragma once

#include "ebu/list/net/udp/listener.h"
#include <map>
#include <set>

namespace ebu_list::srt
{
    class srt_handler : public udp::listener
    {
      public:
        using handler_creator = std::function<udp::listener_uptr(udp::datagram& datagram)>;

        explicit srt_handler(handler_creator creator);

#pragma region udp::listener events
        void on_data(udp::datagram&& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

      private:

        handler_creator creator_;

        udp::listener* find_or_create(udp::datagram& datagram);

        // first: source;
        // second: destination;
        using stream_key  = std::pair<ipv4::endpoint, ipv4::endpoint>;
        using handler_map = std::map<stream_key, udp::listener_uptr>;
        handler_map handlers_;
    };
} // namespace ebu_list::rtp