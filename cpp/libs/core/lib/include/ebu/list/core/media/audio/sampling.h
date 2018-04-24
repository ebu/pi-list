#pragma once

#include <string>

namespace ebu_list::media::audio
{
    enum class audio_sampling
    {
        _44_1kHz,
        _48kHz,
        _96kHz,
        UNKNOWN
    };

    /**
     * Converts the sampling to its integer value.
     * Throws std::invalid_argument if a sampling is not supported/unknown.
     * @param sampling
     * @return integer representation of sampling
     */
    int to_int(audio_sampling sampling);

    /**
     * Converts the sampling to a string representation.
     * Throws std::invalid_argument if a sampling is not supported/unknown.
     * @param sampling
     * @return string representation of sampling
     */
    std::string to_string(audio_sampling sampling);
    audio_sampling parse_audio_sampling(std::string_view s);

    enum class audio_encoding
    {
        L16,
        L24,
        UNKNOWN
    };

    /**
     * Gets the number of bits per channel for the encoding.
     * Throws std::invalid_argument if the encoding is not supported/unknown.
     * @param encoding
     * @return number of bits per channel
     */
    uint8_t number_of_bits(audio_encoding encoding);

    /**
     * Gets encoding given the number of bits per channel.
     * Throws std::invalid_argument if the argument is not supported/unknown.
     * @param bits_per_sample the number of bits per channel
     * @return audio_encoding
     */
    audio_encoding to_audio_encoding(int bits_per_sample);

    audio_encoding parse_audio_encoding(std::string_view s);
    std::string to_string(audio_encoding encoding);
}