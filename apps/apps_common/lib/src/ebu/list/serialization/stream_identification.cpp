#include "ebu/list/serialization/stream_identification.h"

using namespace ebu_list;

nlohmann::json stream_with_details_serializer::to_json(const stream_with_details& stream_info)
{
    const serializable_stream_info& info = std::get<0>(stream_info);
    auto j = serializable_stream_info::to_json(info);

    if(info.type == media::media_type::VIDEO)
    {
        const auto& video_details = std::get<video_stream_details>(std::get<1>(stream_info));
        j.merge_patch(video_stream_details::to_json(video_details));
    }
    else if(info.type == media::media_type::AUDIO)
    {
        const auto& audio_details = std::get<audio_stream_details>(std::get<1>(stream_info));
        j.merge_patch(audio_stream_details::to_json(audio_details));
    }
    else if(info.type == media::media_type::ANCILLARY_DATA)
    {
        const auto& anc_details = std::get<anc_stream_details>(std::get<1>(stream_info));
        j.merge_patch(anc_stream_details::to_json(anc_details));
    }
    else
    {
        j["media_specific"] = nullptr;
    }

    return j;
}

stream_with_details stream_with_details_serializer::from_json(const nlohmann::json& j)
{
    const auto stream_info = serializable_stream_info::from_json(j);

    if( stream_info.type == media::media_type::VIDEO ) return { stream_info, video_stream_details::from_json(j) };
    else if( stream_info.type == media::media_type::AUDIO ) return { stream_info, audio_stream_details::from_json(j) };
    else if( stream_info.type == media::media_type::ANCILLARY_DATA ) return { stream_info, anc_stream_details::from_json(j) };
    else return { stream_info, {} };
}