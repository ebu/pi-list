#pragma once

#include "ebu/list/ptp/decoder.h"

//------------------------------------------------------------------------------
namespace ebu_list::ptp::v2::test
{
    namespace two_step_sequence_1
    {
        sync get_sync();
        sync get_sync_with_timestamp();
        follow_up get_follow_up();
        delay_req get_delay_req();
        delay_resp get_delay_resp();
    }
}
