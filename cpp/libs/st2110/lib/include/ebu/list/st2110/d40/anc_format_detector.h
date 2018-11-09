#pragma once

#include "ebu/list/st2110/common_video_detector.h"
#include "ebu/list/st2110/d40/anc_description.h"

namespace ebu_list::st2110::d40
{
    class anc_format_detector : public detector
    {
    public:
        anc_format_detector();

        status handle_data(const rtp::packet& packet) override;
        virtual details get_details() const override;

    private:
        common_video_detector detector_;
        packet_spacing_analyzer spacing_analyzer_;
        anc_description description_ {};
    };
}
