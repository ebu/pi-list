#include "anc_stream_serializer.h"

using namespace ebu_list;
using json =  nlohmann::json;

//------------------------------------------------------------------------------

anc_stream_serializer::anc_stream_serializer(rtp::packet first_packet,
    serializable_stream_info info,
    anc_stream_details details,
    completion_handler ch,
    path base_dir)
    : anc_stream_handler(std::move(first_packet),
            std::move(info),
            std::move(details),
            std::move(ch)),
            base_dir_(std::move(base_dir))
{
}

void anc_stream_serializer::on_sample()
{
}

void anc_stream_serializer::on_stream_complete()
{
}
