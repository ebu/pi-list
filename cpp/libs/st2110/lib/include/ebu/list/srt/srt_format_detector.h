#pragma once

#include "ebu/list/st2110/format_detector.h"

namespace ebu_list::srt
{

    class srt_format_detector
    {
      public:
        srt_format_detector() = default;

        st2110::detector::status_description handle_data(const udp::datagram& datagram);

      private:
        std::optional<uint32_t> destination_socket_id_;
        std::optional<uint32_t> timestamp_;
    };
} // namespace ebu_list::srt
