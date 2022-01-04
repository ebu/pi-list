#pragma once

#include "ebu/list/rtp/decoder.h"
#include "ebu/list/rtp/listener.h"
#include <algorithm>
#include <memory>
#include <vector>

namespace ebu_list::analysis
{
    template <class ListenerT, class MessageT> struct udp_multi_listener_t : public ListenerT
    {
        using rtp_listener_uptr = std::unique_ptr<rtp::listener>;

        using udp_listener_uptr = std::unique_ptr<udp::listener>;

      public:
        void add_rtp_listener(rtp_listener_uptr&& rtp_sublistener)
        {
            rtp_listeners_.push_back(std::move(rtp_sublistener));
        }

        void add_udp_listener(udp_listener_uptr&& udp_sublistener)
        {
            udp_listeners_.push_back(std::move(udp_sublistener));
        }

        void on_data(const MessageT& p) override
        {
            std::for_each(udp_listeners_.begin(), udp_listeners_.end(), [p](auto& l) { l->on_data(p); });

            auto maybe_rtp_packet = rtp::decode(p.ethernet_info, p.info, std::move(p.sdu));
            if(maybe_rtp_packet)
            {
                auto packet = std::move(maybe_rtp_packet.value());
                std::for_each(rtp_listeners_.begin(), rtp_listeners_.end(), [packet](auto& l) { l->on_data(packet); });
            }
        }

        void on_complete() override
        {
            std::for_each(udp_listeners_.begin(), udp_listeners_.end(), [](auto& l) { l->on_complete(); });
            std::for_each(rtp_listeners_.begin(), rtp_listeners_.end(), [](auto& l) { l->on_complete(); });
        }

        void on_error(std::exception_ptr e) override
        {
            std::for_each(udp_listeners_.begin(), udp_listeners_.end(), [e](auto& l) { l->on_error(e); });
            std::for_each(rtp_listeners_.begin(), rtp_listeners_.end(), [e](auto& l) { l->on_error(e); });
        }

      private:
        using rtp_listeners = std::vector<rtp_listener_uptr>;
        rtp_listeners rtp_listeners_;

        using udp_listeners = std::vector<udp_listener_uptr>;
        udp_listeners udp_listeners_;
    };
} // namespace ebu_list::analysis