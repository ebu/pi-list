#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/core/media/video_description.h"
#include <vector>

namespace ebu_list::st2110
{
    class frame_start_filter : public rtp::listener
    {
    public:
        struct packet_info
        {
            rtp::packet packet;
            bool frame_start = false; // true: if this is the first packet on a frame; false, otherwise.
            int packet_index = 0; // The index of this packet in the current frame.
        };

        class listener
        {
        public:
            virtual ~listener() = default;

            virtual void on_data(const packet_info&) = 0;
            virtual void on_complete() = 0;
            virtual void on_error(std::exception_ptr e) = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        explicit frame_start_filter(listener_uptr listener);
        ~frame_start_filter();

        void on_data(const rtp::packet&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
}
