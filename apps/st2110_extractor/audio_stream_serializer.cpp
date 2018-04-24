#include "audio_stream_serializer.h"

#include "ebu/list/core/platform/native_exec.h"
#include "fmt/ostream.h"
#include <fstream>

using namespace ebu_list;
using json =  nlohmann::json;

//------------------------------------------------------------------------------
namespace
{
    constexpr const char* raw_sample = "raw";
    constexpr const char* mp3_name = "audio.mp3";

    std::string ffmpeg_convert_to_mp3(const path& folder, const st2110::d30::audio_description& audio)
    {
        const auto input = folder / raw_sample;
        const auto output = folder / mp3_name;

        // ffmpeg -f s16be -ar 48k -ac 2 -i sample.pcm -codec:a libmp3lame -qscale:a 2 output.mp3
        return fmt::format("ffmpeg -y -f s{}be -ar {}k -ac {} -i {} -codec:a libmp3lame -qscale:a 2 {}"
                , number_of_bits(audio.encoding)
                , to_int(audio.sampling) / 1000
                , audio.number_channels
                , input
                , output
        );
    }
}
//------------------------------------------------------------------------------

audio_stream_serializer::audio_stream_serializer(rtp::packet first_packet,
    serializable_stream_info info,
    audio_stream_details details,
    completion_handler ch,
    path base_dir)
    : audio_stream_handler(std::move(first_packet), std::move(info), std::move(details), std::move(ch)),
    base_dir_(std::move(base_dir))
{
}

void audio_stream_serializer::on_sample(sample_uptr sample)
{
    samples_.push_back(std::move(sample));
}

void audio_stream_serializer::on_stream_complete()
{
    const auto stream_id = this->network_info().id;
    const auto info_base = base_dir_ / stream_id;
    std::experimental::filesystem::create_directories(info_base);

    {
        std::ofstream o{info_base / raw_sample, std::ios::binary};

        const auto size_of_channel = number_of_bits(this->info().audio.encoding) / 8;

        for ( const auto& sample : samples_ )
        {
            for ( const auto& channel : sample->buffer )
            {
                o.write((char *) channel->cbegin(), size_of_channel);
            }
        }
    }

    // use ffmpeg to generate mp3
    const auto cmd = ffmpeg_convert_to_mp3(info_base, this->info().audio);
    fmt::print("{}", cmd);
    if(native_exec(cmd) == exit_code::error)
    {
        logger()->error("Failed to execute command: {}", cmd);
    }
}
