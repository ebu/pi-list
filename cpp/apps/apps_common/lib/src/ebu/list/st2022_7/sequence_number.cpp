#include "ebu/list/st2022_7/sequence_number.h"
#include <limits>
using namespace ebu_list;
using namespace ebu_list::sequence_number;

///////////////////////////////////////////////////////////////////////////////

template <typename T> compare_result sequence_number::compare(T a, T b)
{
    if(a == b) return compare_result::equal;

    constexpr auto threshold = std::numeric_limits<T>::max() / 2;

    if(a < b)
    {
        if(b - a < threshold) return compare_result::a_before_b;
        return compare_result::a_after_b;
    }

    if(a - b < threshold) return compare_result::a_after_b;
    return compare_result::a_before_b;
}

template compare_result sequence_number::compare<uint16_t>(uint16_t, uint16_t);
template compare_result sequence_number::compare<uint32_t>(uint32_t, uint32_t);

compare_result sequence_number::compare(uint32_t a, uint32_t b, bool is_extended)
{
    return is_extended ? compare(a, b) : compare(static_cast<uint16_t>(a), static_cast<uint16_t>(b));
}
