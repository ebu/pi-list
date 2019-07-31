#include "ebu/list/rtp/sequence_number_analyzer.h"
#include <limits>

using namespace ebu_list;
using namespace ebu_list::rtp;

//------------------------------------------------------------------------------

template <typename Counter>
int64_t sequence_number_analyzer<Counter>::dropped_packets() const noexcept
{
    return num_dropped_;
}

template <typename Counter>
void sequence_number_analyzer<Counter>::handle_packet(Counter sequence_number) noexcept
{
    if (started_)
    {
        if (current_seqnum_ + 1 == sequence_number)
        {
            current_seqnum_++;
        }
        else if (current_seqnum_ < sequence_number)
        {
            num_dropped_ += sequence_number - current_seqnum_ - 1;
            current_seqnum_ = sequence_number;
        }
        else
        {
            num_dropped_ += std::numeric_limits<Counter>::max() - current_seqnum_;
            num_dropped_ += sequence_number;
            current_seqnum_ = sequence_number; 
        }
    }
    else
    {
        started_ = true;
        current_seqnum_ = sequence_number;
    }
}

template class ebu_list::rtp::sequence_number_analyzer<uint16_t>;
template class ebu_list::rtp::sequence_number_analyzer<uint32_t>;
