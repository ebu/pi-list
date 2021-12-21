#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/rtp/header.h"
#include "ebu/list/rtp/dropped_packets_analyzer.h"
#include <vector>

//------------------------------------------------------------------------------

namespace ebu_list::rtp
{
    template <typename Counter> class sequence_number_analyzer
    {
      public:
        void handle_packet(Counter sequence_number, clock::time_point packet_time) noexcept;
        int64_t num_dropped_packets() const noexcept;

        std::vector<packet_gap_info> dropped_packets() const noexcept;

      private:
        bool started_ = false;

        int64_t num_dropped_    = 0;
        Counter current_seqnum_ = 0;
        clock::time_point current_timestamp_{};

        std::vector<packet_gap_info> dropped_packet_samples_{};
        size_t max_samples_ = 10;
    };

} // namespace ebu_list::rtp
