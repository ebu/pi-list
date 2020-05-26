#pragma once

#include "ebu/list/rtp/decoder.h"
#include "ebu/list/sdp/media_description.h"

namespace ebu_list::analysis
{
    class dscp_analyzer
    {
      public:
        void handle_packet(const rtp::packet& packet) noexcept;

        const media::dscp_info& get_info() const noexcept;

      private:
        media::dscp_info info_;
    };
} // namespace ebu_list::analysis
