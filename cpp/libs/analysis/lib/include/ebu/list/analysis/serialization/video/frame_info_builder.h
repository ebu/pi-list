#pragma once

#include "ebu/list/st2110/d21/settings.h"
#include "ebu/list/analysis/handlers/video_stream_handler.h"

namespace ebu_list::analysis
{
    class frame_info_builder
    {
      public:
        void on_packet(const packet_info& p) noexcept;
        void reset() noexcept;

        size_t get_packet_count() const noexcept;
        int64_t get_first_packet_timestamp() const noexcept;
        int64_t get_last_packet_timestamp() const noexcept;

      private:
        size_t packet_count_ = 0;
        std::optional<int64_t> first_packet_timestamp_ = 0;
        int64_t last_packet_timestamp_ = 0;
    };
} // namespace ebu_list::analysis
