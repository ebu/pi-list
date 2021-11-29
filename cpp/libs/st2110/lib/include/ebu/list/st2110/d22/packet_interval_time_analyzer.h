#pragma once

#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/core/math/histogram_bucket.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/types.h"
#include "nlohmann/json.hpp"
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
            std::optional<int64_t> min;
            int64_t avg = 0;
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

        void on_data(const rtp::packet&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110::d22
