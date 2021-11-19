#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/types.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include <ebu/list/core/media/video_description.h>
#include <vector>

using namespace ebu_list::analysis;

namespace ebu_list::st2110::d22
{
    class packet_interval_time_analyzer : public rtp::listener
    {
      public:
        struct packet_interval_time_info
        {
            int64_t max = 0;
            int64_t min = 0;
            int64_t avg = 0;
            int packets_count = 0;
        };

        packet_interval_time_analyzer(histogram_listener_uptr histogram_listener, media::video::Rate rate);
        ~packet_interval_time_analyzer();

        void on_data(const rtp::packet&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110::d22
