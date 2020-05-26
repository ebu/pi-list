#pragma once

#include <cstdint>

namespace ebu_list::sequence_number
{
    //////////////////////////////////////////////////////////////////////////
    // Modulo comparison
    //
    // If it takes more, a_after_b.
    enum class compare_result
    {
        equal,
        a_before_b, // It takes less ticks to go from a to b than from b to a.
        a_after_b
    };

    template <typename T> compare_result compare(T a, T b);

    // delegates to one of the specializations (uint16_t or uint32_t) depending on 'is_extended'.
    compare_result compare(uint32_t a, uint32_t b, bool is_extended);
    //////////////////////////////////////////////////////////////////////////
} // namespace ebu_list::sequence_number
