#include "serializer.h"
#include "ebu/list/serialization/utils.h"
#include "ebu/list/core/media/video_description.h"
#include "ebu/list/core/media/audio_description.h"
#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/st2110/d30/audio_description.h"

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::media::video;
using namespace ebu_list::media::anc;
using namespace ebu_list::st2110::d30;
using namespace std::literals::chrono_literals;

namespace
{
    const std::vector<video::video_sampling> available_sampling = {
            video::video_sampling::YCbCr_4_2_2,
            video::video_sampling::YCbCr_4_4_4,
            video::video_sampling::RGB_4_4_4,
            video::video_sampling::XYZ_4_4_4,
    };

    const std::vector<video::colorimetry > available_colorimetry = {
            video::colorimetry::BT601,
            video::colorimetry::BT709,
            video::colorimetry::BT2020,
            video::colorimetry::BT2100,
            video::colorimetry::ST2063,
            video::colorimetry::ST2065,
            video::colorimetry::XYZ,
            video::colorimetry::UNKNOWN
    };

    using scan_serializable = std::pair<std::string, video::scan_type>;
    const std::vector<scan_serializable > available_scan = {
            {"Progressive", video::scan_type::PROGRESSIVE},
            {"Interlaced", video::scan_type::INTERLACED}
    };

    using rate_preset = std::pair<std::string, video::Rate>;
    const std::vector<rate_preset> available_rates = {
            {"24 Hz", video::Rate(24,1) },
            {"25 Hz", video::Rate(25,1) },
            {"29.97 Hz", video::Rate(30000,1001) },
            {"30 Hz", video::Rate(30,1) },
            {"50 Hz", video::Rate(50,1) },
            {"59.94 Hz", video::Rate(60000,1001) },
            {"60 Hz", video::Rate(60,1) }
    };

    //----------------------------------------------------------------
    const std::vector<audio::audio_encoding> available_encondings = {
            audio::audio_encoding::L16,
            audio::audio_encoding::L24
    };

    using sp_rate = std::pair<std::string, audio::audio_sampling>;
    const std::vector<sp_rate> available_audio_sp_rate = {
            {"48kHz", audio::audio_sampling::_48kHz },
            {"96kHz", audio::audio_sampling::_96kHz}
    };

    using ptime = std::pair<std::string, audio_packet_time >;
    const std::vector<ptime> audio_packet_times = {
            {"125 microseconds", 125us},
            {"250 microseconds", 250us},
            {"333 microseconds", 333us},
            {"1 millisecond", 1ms},
            {"4 milliseconds", 4ms}
    };


    //----------------------------------------------------------------
    template<class ENUM>
    nlohmann::json to_json(ENUM this_enum)
    {
        const auto val = to_string(this_enum);
        return { {"label", val}, {"value", val} };
    }

    template<class T>
    nlohmann::json to_json(std::pair<std::string, T> t)
    {
        return { {"label", t.first}, {"value", to_string(t.second)} };
    }

    template<class ENUM>
    nlohmann::json to_json(const std::vector<ENUM>& values)
    {
        nlohmann::json content;
        for( const auto& value: values )
        {
            content.push_back(to_json(value));
        }
        return content;
    }

    nlohmann::json convert_to_json(const std::string& key, const nlohmann::json& value)
    {
        return { {"key", key}, {"value", value} };
    }
}

void ebu_list::write_available_options_for_video(const ebu_list::path& dir)
{
    nlohmann::json content;
    content.push_back(convert_to_json("sampling", to_json(available_sampling)));
    content.push_back(convert_to_json("colorimetry", to_json(available_colorimetry)));
    content.push_back(convert_to_json("scan_type", to_json(available_scan)));
    content.push_back(convert_to_json("rate", to_json(available_rates)));

    write_json_to(dir, "video_options.json", content);
}

void ebu_list::write_available_options_for_audio(const ebu_list::path& dir)
{
    nlohmann::json content;
    content.push_back(convert_to_json("sample_rate", to_json(available_audio_sp_rate)));
    content.push_back(convert_to_json("encoding", to_json(available_encondings)));
    content.push_back(convert_to_json("packet_time", to_json(audio_packet_times)));

    write_json_to(dir, "audio_options.json", content);
}

void ebu_list::write_available_options_for_ancillary(const ebu_list::path& dir)
{
    nlohmann::json content;
    content.push_back(convert_to_json("stream_type", to_json(anc::stream_types)));

    write_json_to(dir, "ancillary_options.json", content);
}

namespace
{
    using serializable_media_type = std::pair<media::media_type, const char*>; // <value, label>

    // todo: use metaclasses ( one day :) )
    constexpr std::array<serializable_media_type, 4> available_media_types_ = {{
           { media_type::VIDEO, "Video" },
           { media_type::AUDIO, "Audio" },
           { media_type::ANCILLARY_DATA, "Ancillary" },
           { media_type::UNKNOWN, "Unknown" }
   }};
}

void ebu_list::write_available_options(const path& dir)
{
    nlohmann::json content;

    for( const auto& type : available_media_types_ )
    {
        content.emplace_back(nlohmann::json{ {"label", type.second}, {"value", to_string(type.first)} });
    }

    write_json_to(dir, "stream_types.json", content);
}