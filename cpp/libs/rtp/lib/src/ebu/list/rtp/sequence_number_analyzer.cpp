#include "ebu/list/rtp/sequence_number_analyzer.h"
#include <limits>

using namespace ebu_list;
using namespace ebu_list::rtp;

//#define LIST_LOG_SEQNR

//------------------------------------------------------------------------------
template<typename ...Ts>
void log(Ts... ts)
{
#if defined(LIST_LOG_SEQNR)
    logger()->info(ts...);
#endif // defined(LIST_LOG_SEQNR)
}
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
        }
        else if (current_seqnum_ < sequence_number)
        {
            const auto dropped_now = sequence_number - current_seqnum_ - 1;
            num_dropped_ += dropped_now;
            log("Sequence number ({}) is larger than expected. Previous was ({}). Dropped now: {}. Accumulated: {}", sequence_number, current_seqnum_, dropped_now, num_dropped_);
        }
        else
        {
            const auto dropped_now = std::numeric_limits<Counter>::max() - current_seqnum_ + sequence_number;
            num_dropped_ += dropped_now;
            log("Sequence number ({}) is smaller than the previous ({})", sequence_number, current_seqnum_, dropped_now, num_dropped_);
        }

        current_seqnum_ = sequence_number;
    }
    else
    {
        started_ = true;
        current_seqnum_ = sequence_number;
    }
}

template class ebu_list::rtp::sequence_number_analyzer<uint16_t>;
template class ebu_list::rtp::sequence_number_analyzer<uint32_t>;
