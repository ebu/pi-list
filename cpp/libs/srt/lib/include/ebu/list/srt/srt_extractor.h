#pragma once

#include "ebu/list/core/platform/executor.h"
#include "ebu/list/srt/srt_decoder.h"

namespace ebu_list::analysis
{
    class srt_extractor : public srt::srt_decoder
    {
      public:
        using completion_callback = std::function<void(const srt_extractor& vsh)>;

        srt_extractor(udp::datagram first_datagram, path base_dir, executor_ptr main_executor, std::string frame_id_);

      private:
        void on_frame_started(const srt::frame_srt& f) override;

        void on_frame_complete(srt::frame_srt_uptr&& f) override;

        void on_packet(const srt::packet_srt_info& p) override;

        const path base_dir_;
        executor_ptr main_executor_;
        std::string frame_id_;
    };
} // namespace ebu_list::analysis
