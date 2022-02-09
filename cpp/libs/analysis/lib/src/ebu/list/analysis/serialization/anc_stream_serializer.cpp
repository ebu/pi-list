#include "ebu/list/analysis/serialization/anc_stream_serializer.h"
#include "ebu/list/analysis/utils/histogram_listener.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using json = nlohmann::json;

//------------------------------------------------------------------------------

anc_stream_serializer::anc_stream_serializer(const rtp::packet& first_packet, const serializable_stream_info& info,
                                             const anc_stream_details& details, payload_analysis_t payload_analysis,
                                             completion_handler ch, path base_dir)
    : anc_stream_handler(first_packet, info, details, payload_analysis, std::move(ch)), base_dir_(std::move(base_dir))
{
}

void anc_stream_serializer::on_sample()
{
}

void anc_stream_serializer::on_stream_complete()
{
    auto anc_sub_streams = info().anc.sub_streams;
    for(auto it = anc_sub_streams.begin(); it != anc_sub_streams.end(); it++)
    {
        auto path = new ebu_list::path(base_dir_ / network_info().id);
        it->write(*path);
    }
}
