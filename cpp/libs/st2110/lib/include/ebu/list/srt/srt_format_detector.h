#pragma once

#include "ebu/list/net/udp/listener.h"
#include "ebu/list/st2110/common_video_detector.h"

namespace ebu_list::srt
{

    class srt_format_detector : public ebu_list::udp::listener
    {
      public:
        srt_format_detector();

        void on_data(udp::datagram&& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        st2110::detector::status_description status() const noexcept;
        const std::string& get_error_code() const;
        st2110::detector::status_description handle_data(udp::datagram& datagram);

      private:
        st2110::detector::status_description status_description_ =
            st2110::detector::status_description{/*.state=*/st2110::detector::state::detecting,
                                                 /*.error_code*/ "STATUS_CODE_FORMAT_DETECTING"};
        std::string error_code_;
        std::optional<uint32_t> destination_socket_id_;
        std::optional<uint32_t> timestamp_;
        int count_retransmitted_packets = 0;
    };
} // namespace ebu_list::srt
