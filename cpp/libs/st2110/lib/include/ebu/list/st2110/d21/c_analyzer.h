#pragma once

#include "ebu/list/core/media/video_description.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include <vector>

using namespace ebu_list::analysis;

namespace ebu_list::st2110::d21
{
    class c_analyzer : public rtp::listener
    {
      public:
        struct packet_info
        {
            clock::time_point packet_time;
            int cinst;
            bool is_frame_marker;
        };

        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(const packet_info&)    = 0;
            virtual void on_complete()                  = 0;
            virtual void on_error(std::exception_ptr e) = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        c_analyzer(listener_uptr listener, histogram_listener_uptr histogram_listener, int64_t npackets,
                   media::video::Rate rate);
        ~c_analyzer();

        void on_data(const rtp::packet&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110::d21
