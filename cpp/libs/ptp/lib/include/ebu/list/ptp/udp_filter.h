#pragma once

#include "ebu/list/net/udp/listener.h"
#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/message_listener.h"
#include <set>

namespace ebu_list::ptp
{
    class udp_filter : public udp::listener
    {
      public:
        explicit udp_filter(message_listener_ptr ptp_listener, udp::listener_ptr non_ptp_listener);

      private:
#pragma region udp::listener events
        void on_data(udp::datagram&& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

      private:
        const message_listener_ptr ptp_listener_;
        const udp::listener_ptr non_ptp_listener_;
    };
} // namespace ebu_list::ptp