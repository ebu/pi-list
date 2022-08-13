#pragma once

#include "ebu/list/st2110/common_video_detector.h"

namespace ebu_list::st2110::d22
{
    class video_format_detector : public sub_detector
    {
      public:
        video_format_detector();

        detector::status_description handle_data(const rtp::packet& packet) override;
        [[nodiscard]] details get_details() const override;
        [[nodiscard]] full_type get_full_media_type() const override;
        [[nodiscard]] transport_type get_transport_type() const override;
        [[nodiscard]] inline std::string get_kind() const noexcept override { return "video"; }

      private:
        common_video_detector detector_;
        std::optional<uint8_t> packetization_mode;
    };
} // namespace ebu_list::st2110::d22
