#pragma once

#include "ebu/list/net/udp/listener.h"

namespace ebu_list::udp
{
    class udp_filter : public listener
    {
      public:
        udp_filter(listener_ptr l, ipv4::address wanted_address, port wanted_port);
        udp_filter(listener_ptr l, ipv4::endpoint_list wanted_endpoints);

      private:
#pragma region listener events
        void on_data(const udp::datagram& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion listener events

        const listener_ptr listener_;
        const ipv4::endpoint_list wanted_endpoints_;
    };
} // namespace ebu_list::udp
