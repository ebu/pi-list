#pragma once

#include "ebu/list/st2110/common_video_detector.h"
#include "ebu/list/st2110/d40/anc_description.h"

namespace ebu_list::st2110::d40
{
    class anc_format_detector : public sub_detector
    {
      public:
        anc_format_detector();

        detector::status_description handle_data(const rtp::packet& packet) override;
        virtual details get_details() const override;
        virtual std::string get_full_media_type() const override;
        inline virtual std::string get_kind() const noexcept override { return "anc"; }

      private:
        common_video_detector detector_;
        packet_spacing_analyzer spacing_analyzer_;
        anc_description description_{};
    };
} // namespace ebu_list::st2110::d40
