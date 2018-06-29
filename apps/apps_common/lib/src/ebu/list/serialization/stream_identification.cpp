#include "ebu/list/serialization/stream_identification.h"
#include "ebu/list/serialization/utils.h"

#include "ebu/list/constants.h"

using namespace ebu_list;
using namespace std;
namespace fs = std::experimental::filesystem;

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
    else return { stream_info, {} };
}

void ebu_list::write_stream_id_info(const path& dir, const stream_with_details& stream_info)
{
    const serializable_stream_info& info = std::get<0>(stream_info);
    write_json_to(dir / info.id, constants::help_filename, stream_with_details_serializer::to_json(stream_info));
}

std::vector<stream_with_details> ebu_list::scan_folder(const path& folder_path)
{
    std::vector<stream_with_details> found_streams;

    for(auto& p: fs::directory_iterator(folder_path))
    {
        if( fs::is_directory(p) )
        {
            const auto stream_helper = p / constants::help_filename;

            if( fs::exists(stream_helper) )
            {
                const auto json_file = read_from_file(stream_helper);
                found_streams.push_back(stream_with_details_serializer::from_json(json_file));
            }
        }
    }

    return found_streams;
}
