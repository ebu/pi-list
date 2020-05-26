#include "ebu/list/st2110/d30/audio_format_detector.h"

using namespace ebu_list::media;
using namespace ebu_list;
using namespace ebu_list::st2110;
using namespace ebu_list::st2110::d30;

//-----------------------------------------------
namespace
{
    constexpr auto minimum_number_of_valid_timestamps = 5;
    constexpr auto default_audio_sampling_rate        = media::audio::audio_sampling::_48kHz;

    audio_packet_time calculate_packet_time(int sampling_rate, int timestamp_difference)
    {
        const auto t = fraction64(1'000'000'000, sampling_rate) * timestamp_difference;

        return std::chrono::nanoseconds(ceil(t));
    }
} // namespace

//-----------------------------------------------

std::optional<std::tuple<int, int>> d30::calculate_number_of_channels_and_depth(int packet_size, int ticks_per_packet)
{
    if(packet_size % ticks_per_packet != 0) return std::nullopt;
    const auto bytes_per_sample = packet_size / ticks_per_packet;

    if(bytes_per_sample % 3 == 0)
    {
        const auto channels = bytes_per_sample / 3;
        const auto depth    = 24;
        return std::tuple{channels, depth};
    }

    if(bytes_per_sample % 2 == 0)
    {
        const auto channels = bytes_per_sample / 2;
        const auto depth    = 16;
        return std::tuple{channels, depth};
    }

    return std::nullopt;
}

//-----------------------------------------------

detector::status_description timestamp_difference_checker::handle_data(uint32_t timestamp)
{
    if(status_description_.state != detector::state::detecting) return status_description_;

    if(!difference_)
    {
        if(last_timestamp_)
        {
            difference_ = modulo_difference(timestamp, last_timestamp_.value());

            if(difference_.value() == 0)
            {
                status_description_ =
                    detector::status_description{/*.state*/ detector::state::invalid,
                                                 /*.error_code*/ "STATUS_CODE_AUDIO_DIFFERENCE_VALUE_EQUAL_TO_ZERO"};
            }
        }

        last_timestamp_ = timestamp;
        return status_description_;
    }

    assert(last_timestamp_);

    const auto current_difference = modulo_difference(timestamp, last_timestamp_.value());

    last_timestamp_ = timestamp;

    if(current_difference != difference_.value())
    {
        logger()->info("Audio: timestamps are inconsistent. Current difference is {} while the previous was {}.",
                       current_difference, difference_.value());
        status_description_.state      = detector::state::invalid;
        status_description_.error_code = "STATUS_CODE_AUDIO_TIMESTAMPS_INCONSISTENCY";
    }
    else
    {
        ++valid_samples_;

        if(valid_samples_ == minimum_number_of_valid_timestamps)
        {
            status_description_.state      = detector::state::valid;
            status_description_.error_code = "STATUS_CODE_AUDIO_VALID";
        }
    }

    return status_description_;
}

uint32_t timestamp_difference_checker::get_difference() const
{
    assert(difference_);
    return difference_.value();
}

//-----------------------------------------------
detector::status_description packet_size_calculator::handle_data(int packet_size)
{
    if(status_description_.state != detector::state::detecting) return status_description_;

    if(!packet_size_)
    {
        packet_size_ = packet_size;
        return status_description_;
    }

    assert(packet_size_);

    if(packet_size != packet_size_.value())
    {
        status_description_.state      = detector::state::invalid;
        status_description_.error_code = "STATUS_CODE_AUDIO_DIFFERENT_PACKET_SIZE";
    }
    else
    {
        ++valid_samples_;

        if(valid_samples_ == minimum_number_of_valid_timestamps)
        {
            status_description_.state      = detector::state::valid;
            status_description_.error_code = "STATUS_CODE_AUDIO_VALID";
        }
    }

    return status_description_;
}

int packet_size_calculator::get_packet_size() const
{
    assert(packet_size_);
    return packet_size_.value();
}

//-----------------------------------------------

audio_format_detector::audio_format_detector()
{
    description_.sampling = default_audio_sampling_rate;
}

detector::status_description audio_format_detector::handle_data(const rtp::packet& packet)
{
    if(status_description_.state != detector::state::detecting) return status_description_;

    const auto ts_status = ts_checker_.handle_data(packet.info.rtp.view().timestamp());
    const auto ps_status = packet_sizes_.handle_data(static_cast<int>(packet.sdu.view().size()));

    if(ts_status.state == detector::state::invalid)
    {
        return ts_status;
    }

    if(ps_status.state == detector::state::invalid)
    {
        return ps_status;
    }

    if(ts_status.state == detector::state::valid && ps_status.state == detector::state::valid)
    {
        description_.sampling    = default_audio_sampling_rate;
        description_.packet_time = calculate_packet_time(to_int(description_.sampling), ts_checker_.get_difference());

        const auto result =
            calculate_number_of_channels_and_depth(packet_sizes_.get_packet_size(), ts_checker_.get_difference());
        if(!result)
        {
            status_description_.state      = detector::state::invalid;
            status_description_.error_code = "STATUS_CODE_AUDIO_ERROR_CALCULATE_NUMBER_CHANNELS_AND_DEPTH";
            return status_description_;
        }

        auto [number_channels, bit_depth] = result.value();
        description_.number_channels      = static_cast<uint8_t>(number_channels);
        description_.encoding             = audio::to_audio_encoding(bit_depth);

        status_description_.state      = detector::state::valid;
        status_description_.error_code = "STATUS_CODE_AUDIO_VALID";
    }

    return status_description_;
}

detector::details audio_format_detector::get_details() const
{
    return description_;
}
