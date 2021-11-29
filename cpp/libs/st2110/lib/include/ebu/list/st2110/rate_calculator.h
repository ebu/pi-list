#pragma once

#include "ebu/list/core/media/video_description.h"
#include "ebu/list/core/types.h"
#include <set>
#include <optional>
//------------------------------------------------------------------------------

namespace ebu_list::st2110
{
    class rate_calculator
    {
      public:
        static const auto minimum_number_of_frames = 3;

        void on_packet(uint32_t timestamp);

        std::optional<media::video::Rate> rate() const;

      private:
        std::set<uint32_t> timestamps_;
    };
} // namespace ebu_list::st2110
