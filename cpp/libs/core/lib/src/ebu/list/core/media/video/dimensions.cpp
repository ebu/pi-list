#include "ebu/list/core/media/video/dimensions.h"

using namespace ebu_list::media;
using namespace ebu_list::media::video;

std::string video::to_string(video_dimensions raster)
{
    return fmt::format("{}x{}", raster.width, raster.height);
}
