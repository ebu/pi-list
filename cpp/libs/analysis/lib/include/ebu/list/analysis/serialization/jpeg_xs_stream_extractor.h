#pragma once

#include "ebu/list/analysis/handlers/jpeg_xs_stream_handler.h"
#include "ebu/list/core/platform/executor.h"

namespace ebu_list::analysis
{
    class jpeg_xs_stream_extractor : public jpeg_xs_stream_handler
    {
      public:
        using completion_callback = std::function<void(const jpeg_xs_stream_extractor& vsh)>;

        jpeg_xs_stream_extractor(rtp::packet first_packet, path base_dir, executor_ptr main_executor, std::string stream_id);

      private:
        void on_frame_started(const frame& f) override;

        void on_frame_complete(frame_uptr&& f) override;

        void on_packet(const packet_info& p) override;

        const path base_dir_;
        executor_ptr main_executor_;
        std::string stream_id_;
    };
} // namespace ebu_list::analysis
