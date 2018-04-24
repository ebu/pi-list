#pragma once

#include "ebu/list/net/udp/listener.h"
#include <array>

namespace ebu_list::udp
{
    class udp_filter : public listener
    {
    public:
        udp_filter(listener_ptr l, ipv4::address wanted_address, port wanted_port);

    private:
#pragma region listener events
        void on_data(datagram&& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion listener events

        const listener_ptr listener_;
        const ipv4::address wanted_address_;
        const port wanted_port_;
    };
}
