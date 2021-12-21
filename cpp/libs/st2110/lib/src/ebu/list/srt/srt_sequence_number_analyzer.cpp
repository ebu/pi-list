#include "ebu/list/srt/srt_sequence_number_analyzer.h"
#include <limits>

using namespace ebu_list;
using namespace ebu_list::srt;
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

template <typename Counter> int64_t srt_sequence_number_analyzer<Counter>::num_dropped_packets() const noexcept
{
    return dropped_packets_analyzer_.num_dropped_packets();
}

template <typename Counter>
std::vector<packet_gap_info> srt_sequence_number_analyzer<Counter>::dropped_packets() const noexcept
{
    return dropped_packets_analyzer_.dropped_packets();
}

template <typename Counter> int64_t srt_sequence_number_analyzer<Counter>::num_retransmitted_packets() const noexcept
{
    return num_retransmitted_;
}

template <typename Counter>
void srt_sequence_number_analyzer<Counter>::handle_packet(Counter sequence_number, clock::time_point packet_time,
                                                          uint8_t retransmitted_flag, uint8_t packet_type) noexcept
{
    if(packet_type != 0)
    {
        return;
    }
    if(!started_)
    {
        started_        = true;
        current_seqnum_ = sequence_number;
        return;
    }
    if(static_cast<Counter>(current_seqnum_ + 1) == sequence_number)
    {
        current_seqnum_ = sequence_number;
        return;
    }

    if(retransmitted_flag == 1)
    {
        num_retransmitted_++;
        return;
    }
    else
    {
        dropped_packets_analyzer_.handle_packet(static_cast<uint32_t>(sequence_number),
                                                static_cast<uint32_t>(current_seqnum_), packet_time);
        current_seqnum_ = sequence_number;
    }
}

template class ebu_list::srt::srt_sequence_number_analyzer<uint16_t>;
template class ebu_list::srt::srt_sequence_number_analyzer<uint32_t>;
