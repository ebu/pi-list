#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/net/udp/sender.h"

namespace ebu_list
{
    class rtp_playback : public rtp::listener
    {
    public:
        explicit rtp_playback(ipv4::endpoint destination);

        void on_data(const rtp::packet& p) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    private:
        udp::sender sender_;
        ipv4::endpoint destination_;
        std::vector<rtp::packet> packets_;

        uint32_t increment_per_frame_ = 0;
        uint32_t last_packet_timestamp_ = 0;
    };
}