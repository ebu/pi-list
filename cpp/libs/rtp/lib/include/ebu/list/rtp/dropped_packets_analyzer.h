#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/rtp/header.h"
#include <vector>

//------------------------------------------------------------------------------

namespace ebu_list::rtp
{
    struct packet_gap_info
    {
        uint32_t last_sequence_number;  // SN of the last packet before the gap
        uint32_t first_sequence_number; // SN of the first packet after the gap
        clock::time_point
            first_packet_timestamp; // Timestamp of the first packet after the gap (packet timestamp, not RTP timestamp)
    };

    template <typename Counter> class dropped_packets_analyzer
    {
      public:
        void handle_packet(Counter sequence_number, Counter current_seqnum, clock::time_point packet_time) noexcept;
        int64_t num_dropped_packets() const noexcept;

        std::vector<packet_gap_info> dropped_packets() const noexcept;

      private:
        int64_t num_dropped_ = 0;

        std::vector<packet_gap_info> dropped_packet_samples_{};
        size_t max_samples_ = 10;
    };

} // namespace ebu_list::rtp