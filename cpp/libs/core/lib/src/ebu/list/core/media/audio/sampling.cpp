#include "ebu/list/core/media/audio/sampling.h"
#include <stdexcept>

using namespace ebu_list::media;
using namespace ebu_list::media::audio;

audio_sampling audio::parse_audio_sampling(std::string_view s)
{
    if (s == "44100")
        return audio_sampling::_44_1kHz;
    else if (s == "48000")
        return audio_sampling::_48kHz;
    else if (s == "96000")
        return audio_sampling::_96kHz;
    else
        return audio_sampling::UNKNOWN;
}

std::string audio::to_string(audio_sampling sampling)
{
    return std::to_string(to_int(sampling));
}

int audio::to_int(audio_sampling sampling)
{
    switch (sampling)
    {
    case audio_sampling::_48kHz: return 48'000;
    case audio_sampling::_96kHz: return 96'000;
    case audio_sampling::_44_1kHz: return 44'100;
    default: throw std::invalid_argument("Audio sampling not supported!");
    }
}

audio_encoding audio::parse_audio_encoding(std::string_view s)
{
    if (s == "L24")
        return audio_encoding::L24;
    else if (s == "L16")
        return audio_encoding::L16;
    else
        return audio_encoding::UNKNOWN;
}

std::string audio::to_string(audio_encoding encoding)
{
    switch (encoding)
    {
    case audio_encoding::L16: return "L16";
    case audio_encoding::L24: return "L24";
    default: return "unknown";
    }
}

uint8_t audio::number_of_bits(audio_encoding encoding)
{
    switch (encoding)
    {
    case audio_encoding::L16: return 16;
    case audio_encoding::L24: return 24;
    default: throw std::invalid_argument("Audio encoding not supported!");
    }
}

audio_encoding audio::to_audio_encoding(int bits_per_sample)
{
    switch (bits_per_sample)
    {
    case 16: return audio_encoding::L16;
    case 24: return audio_encoding::L24;
    default: throw std::invalid_argument("Audio bit depth not supported!");
    }
}
