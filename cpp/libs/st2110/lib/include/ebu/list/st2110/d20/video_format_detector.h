#pragma once

#include "ebu/list/st2110/common_video_detector.h"
#include "ebu/list/st2110/d21/settings.h"

namespace ebu_list::st2110::d20
{
    class line_data_analyzer
    {
    public:
        detector::status handle_data(const rtp::packet& packet);

        int max_line_number() const noexcept;
        bool is_field_based() const noexcept;

    private:
        int max_line_number_ = 0;
        bool is_field_based_ = false;
    };

    class video_format_detector : public detector
    {
    public:
        video_format_detector();

        status handle_data(const rtp::packet& packet) override;
        virtual details get_details() const override;

    private:
        common_video_detector detector_;
        line_data_analyzer line_analyzer_;
        packet_spacing_analyzer spacing_analyzer_;
    };
}
