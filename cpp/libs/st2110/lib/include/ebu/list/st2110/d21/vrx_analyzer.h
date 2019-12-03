#pragma once

#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/st2110/d21/vrx_calculator.h"

using namespace ebu_list::analysis;

namespace ebu_list::st2110::d21
{
    class vrx_analyzer : public frame_start_filter::listener
    {
      public:
        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(const packet_info&)    = 0;
            virtual void on_complete()                  = 0;
            virtual void on_error(std::exception_ptr e) = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        vrx_analyzer(listener_uptr listener, histogram_listener_uptr histogram_listener, int npackets,
                     media::video::info video_info, vrx_settings settings);
        ~vrx_analyzer();

        void on_data(const frame_start_filter::packet_info&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::st2110::d21
