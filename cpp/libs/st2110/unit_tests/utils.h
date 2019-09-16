#pragma once

#include "rtp_source.h"
#include "ebu/list/st2110/format_detector.h"

namespace ebu_list::test
{
    st2110::detector::status_description run_detector(st2110::detector& d, rtp_source& s);
}
