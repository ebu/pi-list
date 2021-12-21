#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/rtp/dropped_packets_analyzer.h"
#include "ebu/list/rtp/header.h"
#include <vector>

//------------------------------------------------------------------------------

namespace ebu_list::srt
{

    template <typename Counter> class srt_sequence_number_analyzer
    {
      public:
        void handle_packet(Counter sequence_number, clock::time_point packet_time, uint8_t retransmission_flag,
                           uint8_t packet_type) noexcept;
        int64_t num_dropped_packets() const noexcept;
        int64_t num_retransmitted_packets() const noexcept;

        std::vector<rtp::packet_gap_info> dropped_packets() const noexcept;

      private:
        bool started_ = false;
        rtp::dropped_packets_analyzer<uint32_t> dropped_packets_analyzer_;
        Counter current_seqnum_    = 0;
        int64_t num_retransmitted_ = 0;
    };

} // namespace ebu_list::srt
