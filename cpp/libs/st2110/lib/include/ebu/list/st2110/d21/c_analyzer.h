#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/core/media/video_description.h"
#include <vector>
#include <unordered_map>

namespace ebu_list::st2110::d21
{
    using cinst_histogram_t = std::unordered_map<int, int>;

    class cinst_histogram_listener
    {
    public:
        virtual ~cinst_histogram_listener() = default;

        virtual void on_data(const cinst_histogram_t&) = 0;
        virtual void on_complete() = 0;
        virtual void on_error(std::exception_ptr e) = 0;
    };

    using cinst_histogram_listener_ptr = std::shared_ptr<cinst_histogram_listener>;

    class c_analyzer : public rtp::listener
    {
    public:
        struct packet_info
        {
            clock::time_point packet_time;
            int cinst;
            bool is_frame_marker;

            cinst_histogram_t histogram;
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

        c_analyzer(listener_uptr listener, int64_t npackets, media::video::Rate rate);
        ~c_analyzer();

        void on_data(const rtp::packet&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
}
