#pragma once

#include "ebu/list/rtp/decoder.h"

namespace ebu_list::st2110
{
    class packets_per_frame_calculator
    {
      public:
        void on_packet(const rtp::header_lens& header);
        std::optional<int> count() const;

      private:
        std::optional<int> first_frame_;
        std::optional<int> count_;
    };
} // namespace ebu_list::st2110
