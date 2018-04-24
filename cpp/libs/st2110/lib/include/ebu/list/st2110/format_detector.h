#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/d20/video_description.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include <variant>

namespace ebu_list::st2110
{
    class detector
    {
    public:
        virtual ~detector() = default;

        enum class status { detecting, valid, invalid };

        using details = std::variant<std::nullopt_t, 
            d20::video_description, 
            d30::audio_description,
            d40::anc_description>;

        virtual status handle_data(const rtp::packet& packet) = 0;
        virtual details get_details() const = 0;
    };

    class format_detector : public rtp::listener
    {
    public:
        explicit format_detector(rtp::packet first_packet);

        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        detector::status status() const noexcept;
        detector::details get_details() const;

    private:
        std::vector<std::unique_ptr<detector>> detectors_;
        detector::status status_ = detector::status::detecting;
    };
}
