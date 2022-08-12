#pragma once

#include "ebu/list/analysis/handlers/dscp_analyzer.h"
#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/analysis/serialization/video/frame.h"
#include "ebu/list/analysis/serialization/video_serialization.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/rtp/inter_packet_spacing_analyzer.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/d20/packing_mode_analyzer.h"
#include "ebu/list/st2110/rate_calculator.h"

namespace ebu_list::analysis
{
    struct frame_jpeg_xs : frame_info
    {
        std::vector<std::byte> buffer;
    };
    using frame_jpeg_xs_uptr = std::unique_ptr<frame_jpeg_xs>;

    struct packet_jpeg_xs_info
    {
        rtp::packet_info rtp;
        const rtp::packet& packet;
        const frame_jpeg_xs& of_frame;
    };

    class jpeg_xs_stream_handler : public rtp::listener
    {
      public:
        using completion_handler = std::function<void(const jpeg_xs_stream_handler& vsh)>;

        jpeg_xs_stream_handler(rtp::packet first_packet, serializable_stream_info info, video_stream_details details,
                               completion_handler ch);

        const video_stream_details& info() const;
        const serializable_stream_info& network_info() const;

      private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_frame_started(const frame_jpeg_xs& f)      = 0;
        virtual void on_packet(const packet_jpeg_xs_info& p)       = 0;
        virtual void on_frame_complete(frame_jpeg_xs_uptr&& frame) = 0;
#pragma endregion event handlers

        void new_frame();
        void parse_packet(const rtp::packet& packet);
        void detect_frame_transition(uint32_t timestamp);

        serializable_stream_info info_;
        mutable video_stream_details video_description_;
        rtp::inter_packet_spacing_analyzer inter_packet_spacing_;
        st2110::rate_calculator rate_;

        frame_jpeg_xs_uptr current_frame_;
        completion_handler completion_handler_;
    };

    using stream_jpeg_xs_handler_uptr = std::unique_ptr<jpeg_xs_stream_handler>;
} // namespace ebu_list::analysis