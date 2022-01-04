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
    return dropped_packets_analyzer_.num_dropped_packets();
}

template <typename Counter>
std::vector<packet_gap_info> sequence_number_analyzer<Counter>::dropped_packets() const noexcept
{
    return dropped_packets_analyzer_.dropped_packets();
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
        started_        = true;
        current_seqnum_ = sequence_number;
        return;
    }

    if((ssrc & 1) == 0)
    {
        possibly_rist_ = true;
    }

    if(static_cast<Counter>(current_seqnum_ + 1) == sequence_number)
    {
        current_seqnum_ = sequence_number;
        return;
    }

    if(((ssrc & 1) == 1) && possibly_rist_)
    {
        ++retransmitted_packets_;
        current_seqnum_ = sequence_number;
        return;
    }

    dropped_packets_analyzer_.handle_packet(static_cast<Counter>(sequence_number),
                                            static_cast<Counter>(current_seqnum_), packet_time);
    current_seqnum_ = sequence_number;
}

template class ebu_list::rtp::sequence_number_analyzer<uint16_t>;
template class ebu_list::rtp::sequence_number_analyzer<uint32_t>;
