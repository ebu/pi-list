#include <algorithm>
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/media/anc_description.h"

using namespace ebu_list;
using namespace ebu_list::media;
namespace ancillary = ebu_list::media::anc;

std::string ancillary::to_string(ancillary::did_sdid id)
{
    const auto it = std::find_if(ancillary::stream_types.begin(), ancillary::stream_types.end(),
                [=](const auto &stream){
                    return id == stream.second;
                });

   LIST_ENFORCE(it != ancillary::stream_types.end(), std::invalid_argument, "Couldn't find acceptable did_sdid.");

   return std::to_string(static_cast<uint16_t>(it->second));
}

std::string ancillary::to_description(ancillary::did_sdid id)
{
    const auto it = std::find_if(ancillary::stream_types.begin(), ancillary::stream_types.end(),
                [=](const auto &stream){
                    return id == stream.second;
                });

   LIST_ENFORCE(it != ancillary::stream_types.end(), std::invalid_argument, "Couldn't find acceptable did_sdid.");

   return it->first;
}
