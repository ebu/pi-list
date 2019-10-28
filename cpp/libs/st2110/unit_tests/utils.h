#pragma once

#include "ebu/list/st2110/format_detector.h"
#include "rtp_source.h"

namespace ebu_list::test
{
    st2110::detector::status_description run_detector(st2110::detector& d, rtp_source& s);
}
