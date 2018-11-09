#pragma once

#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/st2110/rate_calculator.h"
#include "ebu/list/st2110/packets_per_frame_calculator.h"

namespace ebu_list::st2110
{
    class packet_spacing_analyzer
    {
    public:
        detector::status handle_data(const rtp::packet& packet);

        st2110::d21::read_schedule get_schedule() const noexcept;

        clock::duration average_regular_packet_spacing() const noexcept;
        clock::duration average_frame_start_packet_spacing() const noexcept;

    private:
        detector::status status_ = detector::status::detecting;
        std::optional<clock::time_point> last_packet_timestamp_;
        bool last_frame_was_marked_ = false;
        uint64_t regular_packet_count_ = 0;
        clock::duration regular_packet_total_{};
        uint64_t frame_start_packet_count_ = 0;
        clock::duration frame_start_packet_total_{};
    };

    class common_video_detector
    {
    public:
        struct settings
        {
            int maximum_packets_per_frame;
            int minimum_packets_per_frame;
        };

        explicit common_video_detector(settings _settings);

        detector::status handle_data(const rtp::packet& packet);

        int packets_pre_frame() const;
        media::video::Rate rate() const;

    private:
        const settings settings_;
        detector::status status_ = detector::status::detecting;
    
        int current_frame_ = 0;
        int current_frame_packets_ = 0;
        std::optional<uint32_t> current_frame_rtp_timestamp_ {};
        bool last_frame_was_marked_ = false;
        st2110::rate_calculator rate_;
        st2110::packets_per_frame_calculator packets_per_frame_;
    };
}
