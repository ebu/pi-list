#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/rate_calculator.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/serialization/serializable_stream_info.h"
#include "ebu/list/serialization/video_serialization.h"

namespace ebu_list
{
    struct frame_info
    {
        uint32_t timestamp = 0;
        size_t packet_count = 0;
        int64_t first_packet_timestamp = 0;
        int64_t last_packet_timestamp = 0;
    };

    struct frame : frame_info
    {
        sbuffer_ptr buffer;
    };
    using frame_uptr = std::unique_ptr<frame>;

    struct line_info
    {
        bool valid = false;
        uint16_t length;
        uint16_t line_number;
        uint8_t field_identification;
        bool continuation;
        uint16_t offset;
    };
    using lines_info = std::array<line_info, 3>; // ST2110-20 6.2.1: max 3 line headers per packet

    struct packet_info
    {
        rtp::packet_info rtp;
        const frame& of_frame;
        uint32_t full_sequence_number;
        lines_info line_info;
    };

    class video_stream_handler : public rtp::listener
    {
    public:
        using completion_handler = std::function<void(const video_stream_handler& vsh)>;

        video_stream_handler(rtp::packet first_packet, serializable_stream_info info, video_stream_details details, completion_handler ch);

        const video_stream_details& info() const;
        const serializable_stream_info& network_info() const;

    private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_frame_started(const frame& f) = 0;
        virtual void on_packet(const packet_info& p) = 0;
        virtual void on_frame_complete(frame_uptr&& frame) = 0;
#pragma endregion event handlers

        void new_frame();
        void parse_packet(const rtp::packet& packet);
        void detect_frame_transition(uint32_t timestamp);

        st2110::rate_calculator rate_;
        frame_uptr current_frame_;
        malloc_sbuffer_factory block_factory_;

        serializable_stream_info info_;
        mutable video_stream_details video_description_;

        completion_handler completion_handler_;
    };

    using stream_handler_uptr = std::unique_ptr<video_stream_handler>;
}