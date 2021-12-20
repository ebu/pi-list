#include "ebu/list/rtp/sequence_number_analyzer.h"
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

template <typename Counter> int64_t sequence_number_analyzer<Counter>::num_dropped_packets() const noexcept
{
    return num_dropped_;
}

template <typename Counter>
std::vector<packet_gap_info> sequence_number_analyzer<Counter>::dropped_packets() const noexcept
{
    return dropped_packet_samples_;
}

template <typename Counter> uint32_t sequence_number_analyzer<Counter>::retransmitted_packets() const noexcept
{
    return retransmitted_packets_;
}

template <typename Counter>
void sequence_number_analyzer<Counter>::handle_packet(Counter sequence_number, clock::time_point packet_time,
                                                      uint32_t ssrc) noexcept
{

    if(!started_)
    {
        started_           = true;
        current_seqnum_    = sequence_number;
        current_timestamp_ = packet_time;
        return;
    }

    if((ssrc & 1) == 0)
    {
        possibly_rist_ = true;
    }

    if(static_cast<Counter>(current_seqnum_ + 1) == sequence_number)
    {
        current_seqnum_    = sequence_number;
        current_timestamp_ = packet_time;
        return;
    }

    if(((ssrc & 1) == 1) && possibly_rist_)
    {
        ++retransmitted_packets_;
    }

    if(current_seqnum_ < sequence_number)
    {
        const auto dropped_now = sequence_number - current_seqnum_ - 1;
        num_dropped_ += dropped_now;

        if(dropped_packet_samples_.size() < max_samples_)
            dropped_packet_samples_.push_back(packet_gap_info{current_seqnum_, sequence_number, packet_time});

        log("Sequence number ({}) is larger than expected. Previous was ({}). Dropped now: {}. "
            "Accumulated: {}",
            sequence_number, current_seqnum_, dropped_now, num_dropped_);

        current_seqnum_    = sequence_number;
        current_timestamp_ = packet_time;

        return;
    }

    if(current_seqnum_ > sequence_number)
    {
        const auto dropped_now = std::numeric_limits<Counter>::max() - current_seqnum_ + sequence_number;
        num_dropped_ += dropped_now;

        if(dropped_packet_samples_.size() < max_samples_)
            dropped_packet_samples_.push_back(packet_gap_info{current_seqnum_, sequence_number, packet_time});

        log("Sequence number ({}) is smaller than expected. Previous was ({}). Dropped now: {}. "
            "Accumulated: {}",
            sequence_number, current_seqnum_, dropped_now, num_dropped_);

        current_seqnum_    = sequence_number;
        current_timestamp_ = packet_time;
        return;
    }
}

template class ebu_list::rtp::sequence_number_analyzer<uint16_t>;
template class ebu_list::rtp::sequence_number_analyzer<uint32_t>;
