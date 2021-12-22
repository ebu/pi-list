#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/rtp/dropped_packets_analyzer.h"
#include "ebu/list/rtp/header.h"
#include <vector>

//------------------------------------------------------------------------------

namespace ebu_list::rtp
{
    template <typename Counter> class sequence_number_analyzer
    {
      public:
        void handle_packet(Counter sequence_number, clock::time_point packet_time, uint32_t ssrc) noexcept;
        int64_t num_dropped_packets() const noexcept;
        uint32_t retransmitted_packets() const noexcept;

        std::vector<packet_gap_info> dropped_packets() const noexcept;

      private:
        bool started_ = false;

        Counter current_seqnum_         = 0;
        uint32_t retransmitted_packets_ = 0;
        bool possibly_rist_             = false;
        rtp::dropped_packets_analyzer<uint32_t> dropped_packets_analyzer_;
    };

} // namespace ebu_list::rtp
