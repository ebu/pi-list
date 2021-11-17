#pragma once

#include "ebu/list/st2110/common_video_detector.h"
#include "ebu/list/st2110/d21/settings.h"

namespace ebu_list::st2110::d20
{
    class line_data_analyzer
    {
      public:
        detector::status_description handle_data(const rtp::packet& packet);

        int max_line_number() const noexcept;
        bool is_field_based() const noexcept;

      private:
        int max_line_number_ = 0;
        bool is_field_based_ = false;
    };

    class video_format_detector : public sub_detector
    {
      public:
        video_format_detector();

        detector::status_description handle_data(const rtp::packet& packet) override;
        virtual details get_details() const override;
        virtual std::string get_full_media_type() const override;
        inline virtual std::string get_kind() const noexcept override { return "video"; }

      private:
        common_video_detector detector_;
        line_data_analyzer line_analyzer_;
        packet_spacing_analyzer spacing_analyzer_;
    };
} // namespace ebu_list::st2110::d20
