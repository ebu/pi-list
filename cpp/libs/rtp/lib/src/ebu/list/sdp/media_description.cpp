#include "ebu/list/sdp/media_description.h"

using namespace ebu_list;
using namespace std;

string media::to_string(media_type media_type)
{
    switch(media_type)
    {
    case media_type::VIDEO: return "video";
    case media_type::AUDIO: return "audio";
    case media_type::ANCILLARY_DATA: return "ancillary_data";
    case media_type::TTML: return "ttml";
    default: assert(media_type == media_type::UNKNOWN); return "unknown";
    }
}

media::media_type media::from_string(std::string_view media)
{
    if(media == "video")
        return media_type::VIDEO;
    else if(media == "audio")
        return media_type::AUDIO;
    else if(media == "ancillary_data")
        return media_type::ANCILLARY_DATA;
    else if(media == "ttml")
        return media_type::TTML;
    else
        return media_type::UNKNOWN;
}
