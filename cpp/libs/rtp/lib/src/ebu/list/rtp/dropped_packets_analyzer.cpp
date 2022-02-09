#include "ebu/list/rtp/dropped_packets_analyzer.h"
#include <limits>

using namespace ebu_list;
using namespace ebu_list::rtp;

// #define LIST_LOG_SEQNR

//------------------------------------------------------------------------------
template <typename... Ts> void log([[maybe_unused]] Ts... ts)
{
#if defined(LIST_LOG_SEQNR)
    logger()->info(ts...);
#endif // defined(LIST_LOG_SEQNR)
}
//------------------------------------------------------------------------------

template <typename Counter> int64_t dropped_packets_analyzer<Counter>::num_dropped_packets() const noexcept
{
    return num_dropped_;
}

template <typename Counter>
std::vector<packet_gap_info> dropped_packets_analyzer<Counter>::dropped_packets() const noexcept
{
    return dropped_packet_samples_;
}

template <typename Counter>
void dropped_packets_analyzer<Counter>::handle_packet(Counter sequence_number, Counter current_seqnum,
                                                      clock::time_point packet_time) noexcept
{
    if(current_seqnum < sequence_number)
    {
        const auto dropped_now = sequence_number - current_seqnum - 1;
        num_dropped_ += dropped_now;

        if(dropped_packet_samples_.size() < max_samples_)
            dropped_packet_samples_.push_back(packet_gap_info{current_seqnum, sequence_number, packet_time});

        log("Sequence number ({}) is larger than expected. Previous was ({}). Dropped now: {}. "
            "Accumulated: {}",
            sequence_number, current_seqnum, dropped_now, num_dropped_);
    }
    else if(current_seqnum > sequence_number)
    {
        const auto dropped_now = std::numeric_limits<Counter>::max() - current_seqnum + sequence_number;
        num_dropped_ += dropped_now;

        if(dropped_packet_samples_.size() < max_samples_)
            dropped_packet_samples_.push_back(packet_gap_info{current_seqnum, sequence_number, packet_time});

        log("Sequence number ({}) is smaller than expected. Previous was ({}). Dropped now: {}. "
            "Accumulated: {}",
            sequence_number, current_seqnum, dropped_now, num_dropped_);
    }
}

template class ebu_list::rtp::dropped_packets_analyzer<uint16_t>;
template class ebu_list::rtp::dropped_packets_analyzer<uint32_t>;
