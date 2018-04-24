#include "ebu/list/ptp/v2/delay_resp.h"

using namespace ebu_list::ptp::v2;
using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------

delay_resp_lens::delay_resp_lens(const delay_resp_body& h) noexcept : h_(h)
{
}

ts80 delay_resp_lens::receive_timestamp() const noexcept
{
    return to_ts80(h_.receive_timestamp);
}

byte80 delay_resp_lens::requesting_port_identity() const noexcept
{
    return h_.requesting_port_identity;
}
