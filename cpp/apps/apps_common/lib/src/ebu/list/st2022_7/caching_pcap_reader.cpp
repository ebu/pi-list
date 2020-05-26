#include "ebu/list/st2022_7/caching_pcap_reader.h"

using namespace ebu_list;

///////////////////////////////////////////////////////////////////////////////
namespace
{
} // namespace
///////////////////////////////////////////////////////////////////////////////

caching_pcap_reader::caching_pcap_reader(filtered_pcap_reader_uptr&& source)
    : source_(std::move(source)), next_(source_->next())
{
}

const std::optional<rtp::packet>& caching_pcap_reader::current() const noexcept
{
    return next_;
}

void caching_pcap_reader::next()
{
    next_ = source_->next();
}
