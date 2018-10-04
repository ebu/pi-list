#pragma once

#include "ebu/list/core/media/video_description.h"
#include "ebu/list/sdp/media_description.h"
#include "ebu/list/st2110/d10/network.h"

namespace ebu_list::st2110::d40
{
    namespace video = ebu_list::media::video;

    struct anc_description : d10::stream_information
    {
        video::Rate rate = video::Rate(0,1);
        // list of ANC channels
    };
}
