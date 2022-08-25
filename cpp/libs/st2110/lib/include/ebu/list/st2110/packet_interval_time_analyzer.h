#pragma once

#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/core/math/histogram_bucket.h"
#include "ebu/list/net/udp/listener.h"
#include "ebu/list/rtp/types.h"
#include "nlohmann/json.hpp"
#include <ebu/list/core/media/video_description.h>
#include <vector>

using namespace ebu_list::analysis;

namespace ebu_list::st2110
{
    class packet_interval_time_analyzer : public udp::listener
    {
      public:
        struct min_max_avg_t
        {
            int64_t min = 0;
            int64_t max = 0;
            double_t avg = 0;
        };

        struct packet_interval_time_info
        {
            std::optional<min_max_avg_t> data;
            histogram_t histogram;
            int bucket_width;
            int packets_count = 0;
        };

        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(const packet_interval_time_info&) = 0;
            virtual void on_complete()                             = 0;
            virtual void on_error(std::exception_ptr e)            = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        packet_interval_time_analyzer(listener_uptr listener);
        ~packet_interval_time_analyzer();

        void on_data(const udp::datagram& datagram) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110
