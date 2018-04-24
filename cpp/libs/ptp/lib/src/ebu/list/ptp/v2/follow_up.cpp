#include "ebu/list/ptp/v2/follow_up.h"

using namespace ebu_list;
using namespace ebu_list::ptp;
using namespace ebu_list::ptp::v2;

//------------------------------------------------------------------------------

follow_up_lens::follow_up_lens(const follow_up_body& h) noexcept : h_(h)
{
}

ts80 follow_up_lens::precise_origin_timestamp() const noexcept
{
    return to_ts80(h_.precise_origin_timestamp);
}
