/*
 * Copyright (C) 2020 European Broadcasting Union - Technology & Innovation
 * Copyright (C) 2020 CBC / Radio-Canada
 */

#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/types.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/st2110/frame_start_filter.h"

namespace ebu_list::st2110::d20
{
    class rtp_analyzer : public frame_start_filter::listener
    {
      public:
        struct packet_info
        {
            clock::time_point timestamp{};
            int packets_per_frame = 0;
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
        using histogram_listener_uptr = std::unique_ptr<ebu_list::analysis::histogram_listener>;

        rtp_analyzer(listener_uptr l, histogram_listener_uptr l_h);
        ~rtp_analyzer();

        void on_data(const frame_start_filter::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110::d20
