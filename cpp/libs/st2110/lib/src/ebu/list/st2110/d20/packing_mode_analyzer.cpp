#include "ebu/list/st2110/d20/packing_mode_analyzer.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d20;

//------------------------------------------------------------------------------

void packing_mode_analyzer::on_data(size_t srd_length, bool marker_bit)
{
    if(marker_bit) return; // The last packet can be whatever size

    constexpr size_t bpm_size = 180;
    const bool is_multiple    = srd_length % bpm_size == 0;
    if(is_multiple) return;
    mode_ = packing_mode_t::general;
}

packing_mode_t packing_mode_analyzer::get_mode() const
{
    return mode_;
}
