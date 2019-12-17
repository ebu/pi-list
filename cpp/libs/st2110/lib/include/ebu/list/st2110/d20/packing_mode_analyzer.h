#pragma once

#include "ebu/list/st2110/d20/video_description.h"

namespace ebu_list::st2110::d20
{
    class packing_mode_analyzer
    {
      public:
        void on_data(size_t srd_length, bool marker_bit);

        packing_mode_t get_mode() const;

      private:
        packing_mode_t mode_ = packing_mode_t::block;
    };
} // namespace ebu_list::st2110::d20
