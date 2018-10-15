#include "ebu/list/core/media/video_description.h"
#include <stdexcept>
#include <cassert>

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::media::video;

std::string video::to_string(scan_type scan)
{
    switch(scan)
    {
        case scan_type::INTERLACED: return "interlaced";
        default:
            assert(scan == scan_type::PROGRESSIVE);
            return "progressive";
    }
}

scan_type video::parse_scan_type(std::string_view s)
{
    if( s == "interlaced" ) return scan_type::INTERLACED;
    else if( s == "progressive" ) return scan_type::PROGRESSIVE;
    else throw std::runtime_error("Invalid Scan Type");
}

Rate video::parse_from_string(std::string_view s)
{
    if (s == "0") return video::Rate(0);
    else if( s == "24" ) return video::Rate(24,1);
    else if( s == "25" ) return video::Rate(25,1);
    else if( s == "30000/1001" ) return video::Rate(30000,1001);
    else if( s == "30" ) return video::Rate(30,1);
    else if( s == "50" ) return video::Rate(50,1);
    else if( s == "60000/1001" ) return video::Rate(60000,1001);
    else if( s == "60" ) return video::Rate(60,1);
    else 
    {
        logger()->error("Invalid rate: {}", s);
        // TODO: review this
        // throw std::runtime_error("invalid preset value");
        return {};
    }
}
