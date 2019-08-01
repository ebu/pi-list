#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/rtp/header.h"

//------------------------------------------------------------------------------

namespace ebu_list::rtp
{
    template <typename Counter>
    class sequence_number_analyzer
    {
      public:
        void handle_packet(Counter sequence_number) noexcept;
        int64_t dropped_packets() const noexcept;

      private:
        bool started_ = false;
        Counter current_seqnum_ = 0;
        int64_t num_dropped_ = 0;
    };
} // namespace ebu_list::rtp
