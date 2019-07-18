#include "ebu/list/serialization/audio_serialization.h"

using namespace ebu_list;
using namespace std;

nlohmann::json audio_stream_details::to_json(const audio_stream_details& details)
{
    nlohmann::json statistics;
    statistics["sample_size"] = details.sample_size;
    statistics["samples_per_packet"] = details.samples_per_packet;
    statistics["packet_count"] = details.packet_count;
    statistics["dropped_packet_count"] = details.dropped_packet_count;
    statistics["sample_count"] = details.sample_count;
    statistics["first_packet_ts"] = std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count());
    statistics["last_packet_ts"] = std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count());

    nlohmann::json j;
    j["media_specific"] = st2110::d30::to_json(details.audio);
    j["statistics"] = statistics;

    return j;
}

audio_stream_details audio_stream_details::from_json(const nlohmann::json& j)
{
    audio_stream_details desc{};
    desc.audio = st2110::d30::from_json(j.at("media_specific"));

    const auto statistics_json = j.find("statistics");
    if (statistics_json != j.end())
    {
        desc.sample_size = statistics_json->at("sample_size").get<int>();
        desc.samples_per_packet = statistics_json->at("samples_per_packet").get<int>();
        desc.packet_count = statistics_json->at("packet_count").get<uint32_t>();
        desc.dropped_packet_count = statistics_json->at("dropped_packet_count").get<uint32_t>();
        desc.sample_count = statistics_json->at("sample_count").get<uint32_t>();
        desc.first_packet_ts = clock::time_point{ clock::duration{ std::stol(statistics_json->at("first_packet_ts").get<std::string>()) } };
        desc.last_packet_ts = clock::time_point{ clock::duration{ std::stol(statistics_json->at("last_packet_ts").get<std::string>()) } };
    }

    return desc;
}

nlohmann::json st2110::d30::to_json(const st2110::d30::audio_description& desc)
{
    nlohmann::json j;
    j["encoding"] = to_string(desc.encoding);
    j["sampling"] = to_string(desc.sampling);
    j["number_channels"] = desc.number_channels;
    j["packet_time"] = d30::to_string(desc.packet_time);

    return j;
}

st2110::d30::audio_description st2110::d30::from_json(const nlohmann::json& j)
{
    audio_description desc{};

    if( j.empty() ) // media_specific was empty, using default values
        return desc;

    desc.sampling = media::audio::parse_audio_sampling(j.at("sampling").get<string>());
    desc.encoding = media::audio::parse_audio_encoding(j.at("encoding").get<string>());
    desc.number_channels = j.at("number_channels").get<uint8_t>();
    desc.packet_time = st2110::d30::parse_packet_time(j.at("packet_time").get<string>());

    return desc;
}
