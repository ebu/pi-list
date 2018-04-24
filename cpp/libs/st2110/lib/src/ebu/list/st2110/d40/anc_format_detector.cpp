#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/st2110/d40/anc_description.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list::st2110;
using namespace ebu_list;

//------------------------------------------------------------------------------
namespace
{
    constexpr auto maximum_packets_per_frame = 20;
    constexpr auto minimum_packets_per_frame = 1;
}
//------------------------------------------------------------------------------

anc_format_detector::anc_format_detector()
    : detector_({ maximum_packets_per_frame, minimum_packets_per_frame })
{
}

detector::status anc_format_detector::handle_data(const rtp::packet& packet)
{
    return detector_.handle_data(packet);
}

detector::details anc_format_detector::get_details() const
{
    auto d = anc_description{};
    d.rate = detector_.rate();
    return d;
}
