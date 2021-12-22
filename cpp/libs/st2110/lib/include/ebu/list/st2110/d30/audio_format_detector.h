#pragma once

#include "ebu/list/st2110/format_detector.h"

namespace ebu_list::st2110::d30
{
    std::optional<std::tuple<int, int>> calculate_number_of_channels_and_depth(int packet_size, int ticks_per_packet);

    class timestamp_difference_checker
    {
      public:
        detector::status_description handle_data(uint32_t timestamp);

        uint32_t get_difference() const;

      private:
        detector::status_description status_description_ =
            detector::status_description{/*.state*/ detector::state::detecting,
                                         /*.error_code*/ "STATUS_CODE_AUDIO_DETECTING"};
        std::optional<uint32_t> difference_{};
        std::optional<uint32_t> last_timestamp_{};
        int valid_samples_ = 0;
    };

    class packet_size_calculator
    {
      public:
        detector::status_description handle_data(int packet_size);

        int get_packet_size() const;

      private:
        detector::status_description status_description_ =
            detector::status_description{/*.state*/ detector::state::detecting,
                                         /*.error_code*/ "STATUS_CODE_AUDIO_DETECTING"};
        std::optional<int> packet_size_{};
        int valid_samples_ = 0;
    };

    class audio_format_detector : public sub_detector
    {
      public:
        audio_format_detector();

        detector::status_description handle_data(const rtp::packet& packet) override;
        virtual details get_details() const override;
        virtual full_type get_full_media_type() const override;
        virtual transport_type get_transport_type() const override;
        inline virtual std::string get_kind() const noexcept override { return "audio"; }

      private:
        detector::status_description status_description_ =
            detector::status_description{/*.state*/ detector::state::detecting,
                                         /*.error_code*/ "STATUS_CODE_AUDIO_DETECTING"};
        audio_description description_{};
        timestamp_difference_checker ts_checker_{};
        packet_size_calculator packet_sizes_{};
    };
} // namespace ebu_list::st2110::d30
