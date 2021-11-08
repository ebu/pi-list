#pragma once

#include "ebu/list/analysis/handlers/video_stream_handler.h"
#include "ebu/list/core/platform/executor.h"

namespace ebu_list::analysis
{
    class video_stream_extractor : public video_stream_handler
    {
      public:
        using completion_callback = std::function<void(const video_stream_extractor& vsh)>;

        video_stream_extractor(rtp::packet first_packet, serializable_stream_info info, video_stream_details details,
                                path base_dir, executor_ptr main_executor);

      private:
        void on_frame_started(const frame& f) override;

        void on_frame_complete(frame_uptr&& f) override;

        void on_packet(const packet_info& p) override;

        const path base_dir_;
        executor_ptr main_executor_;
        const media::video::video_dimensions frame_size_;
    };
} // namespace ebu_list::analysis
