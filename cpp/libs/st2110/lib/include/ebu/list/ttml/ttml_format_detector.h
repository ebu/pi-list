#pragma once

#include "ebu/list/ttml/ttml_description.h"
#include "ebu/list/st2110/format_detector.h"

namespace ebu_list::ttml
{
    class format_detector : public ebu_list::st2110::sub_detector
    {
      public:
        format_detector();

        ebu_list::st2110::detector::status_description
            handle_data(const rtp::packet& packet) override;

        virtual ebu_list::st2110::detector::details
            get_details() const override;

        inline virtual std::string
            get_kind() const noexcept override
                { return "ttml"; }

      private:
        description description_{};
        std::string document_;
    };
} // namespace ebu_list::st2110::d40

