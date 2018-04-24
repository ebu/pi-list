#include "ebu/list/ptp/v2/sync.h"

using namespace ebu_list::ptp::v2;
using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------

sync_message_lens::sync_message_lens(const sync_body& h) noexcept : h_(h)
{
}

ts80 sync_message_lens::origin_timestamp() const noexcept
{
    return to_ts80(h_.origin_timestamp);
}
