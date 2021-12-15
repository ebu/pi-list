#pragma once

#include "ebu/list/st2110/format_detector.h"

namespace ebu_list::srt
{

    class srt_format_detector
    {
      public:
        srt_format_detector();

        st2110::detector::status_description handle_data(udp::datagram&& datagram);
        int64_t get_num_retransmitted_packets() const;

      private:
        std::optional<uint32_t> destination_socket_id_;
        std::optional<uint32_t> timestamp_;
        int64_t num_retransmitted_packets_;
    };
} // namespace ebu_list::srt
