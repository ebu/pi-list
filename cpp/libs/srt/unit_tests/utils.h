#pragma once

#include "ebu/list/srt/srt_format_detector.h"
#include "ebu/list/st2110/format_detector.h"
#include "udp_source.h"

namespace ebu_list::test
{
    st2110::detector::status_description run_srt_format_detector(srt::srt_format_detector& srt_d, udp_source& s);
}
