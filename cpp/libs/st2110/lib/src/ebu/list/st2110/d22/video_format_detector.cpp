#include "ebu/list/st2110/d22/video_format_detector.h"

using namespace ebu_list::st2110::d22;
using namespace ebu_list::st2110;
using namespace ebu_list;

namespace {
    constexpr auto maximum_packets_per_frame = 1000;
    constexpr auto minimum_packets_per_frame = 20;
}

video_format_detector::video_format_detector() : detector_({maximum_packets_per_frame, minimum_packets_per_frame})
{
}

detector::status_description video_format_detector::handle_data(const rtp::packet& packet)
{
    //Verify packet payload header to see if matches payload header of jpeg xs

    //Check packets rtp timestamps
    return detector_.handle_data(packet);
}