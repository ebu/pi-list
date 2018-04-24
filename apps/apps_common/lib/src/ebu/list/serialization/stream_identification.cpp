#include "ebu/list/serialization/stream_identification.h"
#include "ebu/list/serialization/utils.h"

#include "ebu/list/constants.h"

using namespace ebu_list;
using namespace std;
namespace fs = std::experimental::filesystem;

nlohmann::json ebu_list::to_json(const stream_with_details& stream_info)
{
    const serializable_stream_info& info = std::get<0>(stream_info);
    auto j = to_json(info);

    if(info.type == media::media_type::VIDEO)
    {
        const auto& video_details = std::get<video_stream_details>(std::get<1>(stream_info));
        j["media_specific"] = st2110::d20::to_json(video_details.video);
        j["media_specific"]["packets_per_frame"] = video_details.video.packets_per_frame;
    }
    else if(info.type == media::media_type::AUDIO)
    {
        const auto& audio_details = std::get<audio_stream_details>(std::get<1>(stream_info));
        j["media_specific"] = st2110::d30::to_json(audio_details.audio);
    }
    else
    {
        j["media_specific"] = nullptr;
    }

    return j;
}

void ebu_list::write_stream_id_info(const path& dir, const stream_with_details& stream_info)
{
    const serializable_stream_info& info = std::get<0>(stream_info);
    write_json_to(dir / info.id, constants::help_filename, to_json(stream_info));
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
                found_streams.push_back(from_json(stream_helper));
            }
        }
    }

    return found_streams;
}

stream_with_details ebu_list::from_json(const path& json_file)
{
    const auto j = read_from_file(json_file);

    const auto stream_info = from_json(j);

    const auto media_info = j.at("media_specific");

    if( stream_info.type == media::media_type::VIDEO ) return { stream_info, parse_video_json(media_info) };
    else if( stream_info.type == media::media_type::AUDIO ) return { stream_info, parse_audio_json(media_info) };
    else return { stream_info, {} };
}