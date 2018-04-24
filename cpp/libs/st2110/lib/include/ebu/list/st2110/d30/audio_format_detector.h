#pragma once

#include "ebu/list/st2110/format_detector.h"

namespace ebu_list::st2110::d30
{
    class timestamp_difference_checker
    {
    public:
        detector::status handle_data(uint32_t timestamp);

        uint32_t get_difference() const;

    private:
        detector::status status_ = detector::status::detecting;
        std::optional<uint32_t> difference_ {};
        std::optional<uint32_t> last_timestamp_ {};
        int valid_samples_ = 0;
    };

    class packet_size_calculator
    {
    public:
        detector::status handle_data(int packet_size);

        int get_packet_size() const;

    private:
        detector::status status_ = detector::status::detecting;
        std::optional<int> packet_size_ {};
        int valid_samples_ = 0;
    };

    class audio_format_detector : public detector
    {
    public:
        audio_format_detector();

        status handle_data(const rtp::packet& packet) override;
        virtual details get_details() const override;

    private:
        status status_ = status::detecting;

        audio_description description_ {};
        timestamp_difference_checker ts_checker_ {};
        packet_size_calculator packet_sizes_ {};
    };
}
