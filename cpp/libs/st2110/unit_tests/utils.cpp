#include "pch.h"
#include "utils.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------

detector::status test::run_detector(detector& d, rtp_source& s)
{
    for (;;)
    {
        auto packet = s.next();
        if(!packet) return detector::status::invalid;

        const auto result = d.handle_data(packet.value());
        if (result == detector::status::valid || result == detector::status::invalid) return result;
    }
}
