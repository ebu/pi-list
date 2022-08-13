#pragma once

#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/analysis/serialization/video/frame.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/listener.h"
#include "ebu/list/srt/header.h"
#include "ebu/list/st2110/d20/packing_mode_analyzer.h"
#include "ebu/list/st2110/rate_calculator.h"

namespace ebu_list::srt
{
    struct frame_srt : analysis::frame_info
    {
        std::vector<std::byte> buffer;
    };

    using frame_srt_uptr = std::unique_ptr<frame_srt>;

    struct packet_srt_info
    {
        udp::datagram_info udp;
        const udp::datagram& packet;
        const frame_srt& of_frame;
    };

    class srt_decoder : public udp::listener
    {
      public:
        using completion_handler = std::function<void(const srt_decoder& vsh)>;

        srt_decoder(udp::datagram first_packet, completion_handler ch);

      private:
#pragma region udp::listener events
        void on_data(const udp::datagram& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_frame_started(const frame_srt& f)      = 0;
        virtual void on_packet(const packet_srt_info& p)       = 0;
        virtual void on_frame_complete(frame_srt_uptr&& frame) = 0;
#pragma endregion event handlers

        void new_frame();
        void parse_packet(const udp::datagram& packet);
        void detect_frame_transition(uint32_t timestamp);

        uint32_t last_frame_ts_ = 0;
        uint32_t frame_count_   = 0;

        frame_srt_uptr current_frame_;
        completion_handler completion_handler_;
    };

    using srt_handler_uptr = std::unique_ptr<srt_decoder>;
} // namespace ebu_list::srt