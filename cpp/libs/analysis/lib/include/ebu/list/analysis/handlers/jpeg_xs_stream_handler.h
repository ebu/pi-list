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
    struct frame : frame_info
    {
        sbuffer_ptr buffer;
    };
    using frame_uptr = std::unique_ptr<frame>;

    struct packet_info
    {
        rtp::packet_info rtp;
        const rtp::packet& packet;
        const frame& of_frame;
        uint32_t full_sequence_number;
        lines_info line_info;
    };

    class jpeg_xs_stream_handler : public rtp::listener
    {
      public:
        using completion_handler = std::function<void(const jpeg_xs_stream_handler& vsh)>;

        jpeg_xs_stream_handler(rtp::packet first_packet, completion_handler ch);

      private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_frame_started(const frame& f)      = 0;
        virtual void on_packet(const packet_info& p)       = 0;
        virtual void on_frame_complete(frame_uptr&& frame) = 0;
#pragma endregion event handlers

        void new_frame();
        void parse_packet(const rtp::packet& packet);
        void detect_frame_transition(uint32_t timestamp);

        uint32_t last_frame_ts_ = 0;
        uint32_t frame_count_   = 0;

        frame_uptr current_frame_;
        completion_handler completion_handler_;
    };

    using stream_handler_uptr = std::unique_ptr<jpeg_xs_stream_handler>;
} // namespace ebu_list::analysis