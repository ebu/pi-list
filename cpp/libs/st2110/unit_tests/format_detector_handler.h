#pragma once

#include "ebu/list/net/udp/listener.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/format_detector.h"
#include <map>
#include <set>

namespace ebu_list::st2110
{
    class format_detector_handler : public udp::listener
    {
      public:
        format_detector_handler() = default;
        detector::status_description status() const noexcept;
        detector::details get_details() const;
        detector::full_type get_full_media_type() const;

        const std::map<std::string, std::vector<std::string>>& get_error_codes() const;

#pragma region udp::listener events
        void on_data(const udp::datagram& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

      private:
        st2110::format_detector format_detector_;
    };
} // namespace ebu_list::st2110