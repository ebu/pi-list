#include "ebu/list/ptp/v2/delay_req.h"

using namespace ebu_list::ptp::v2;
using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------

delay_req_lens::delay_req_lens(const delay_req_body& h) noexcept : h_(h)
{
}

ts80 delay_req_lens::origin_timestamp() const noexcept
{
    return to_ts80(h_.origin_timestamp);
}
