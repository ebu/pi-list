#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/serialization/serializable_stream_info.h"
#include "ebu/list/st2110/rate_calculator.h"
#include "ebu/list/st2110/packets_per_frame_calculator.h"
#include "ebu/list/st2110/format_detector.h"

namespace ebu_list
{
    class stream_listener: public rtp::listener
    {
    public:
        stream_listener(rtp::packet first_packet, path base_dir, std::string pcap_id);

        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    private:
        serializable_stream_info stream_id_;
        logger_ptr logger_;
        path base_dir_;
        std::string pcap_id_;
        st2110::format_detector detector_;
    };
}
