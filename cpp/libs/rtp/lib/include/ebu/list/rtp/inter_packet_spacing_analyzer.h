#pragma once

#include "ebu/list/sdp/media_description.h"

namespace ebu_list::rtp
{
    class packet;

    class inter_packet_spacing_analyzer
    {
      public:
        void handle_data(const packet& packet);

        media::inter_packet_spacing_info_t get_info() const noexcept;

      private:
        std::optional<clock::time_point> last_packet_timestamp_;
        bool last_packet_was_marked_   = false;
        uint64_t regular_packet_count_ = 0;
        uint64_t marked_packet_count_  = 0;
        media::inter_packet_spacing_info_t info_{};
    };
} // namespace ebu_list::rtp
