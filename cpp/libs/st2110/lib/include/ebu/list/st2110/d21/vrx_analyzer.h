#pragma once

#include "ebu/list/st2110/d21/vrx_settings.h"
#include "ebu/list/st2110/d21/frame_start_filter.h"
#include "ebu/list/core/media/video_description.h"

namespace ebu_list::st2110::d21
{
    class vrx_analyzer : public frame_start_filter::listener
    {
    public:
        struct packet_info
        {
            clock::time_point packet_time {};
            int vrx {};
            std::optional<double> delta_to_ideal_tpr0 {};
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

        enum tvd_kind 
        { 
            ideal, 
            first_packet_first_frame, 
            first_packet_each_frame
        };

        struct vrx_settings
        {
            read_schedule schedule;
            tvd_kind tvd;
        };

        vrx_analyzer(listener_uptr listener, int64_t npackets, media::video::info video_info, vrx_settings settings);
        ~vrx_analyzer();

        void on_data(const frame_start_filter::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
}
