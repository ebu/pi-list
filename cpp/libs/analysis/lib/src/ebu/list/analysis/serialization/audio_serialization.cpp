#include "ebu/list/analysis/serialization/audio_serialization.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace std;

nlohmann::json audio_stream_details::to_json(const audio_stream_details& details)
{
    nlohmann::json statistics;
    analysis::to_json(statistics, static_cast<const common_stream_details&>(details));
    statistics["first_sample_ts"]    = details.first_sample_ts;
    statistics["last_sample_ts"]     = details.last_sample_ts;
    statistics["packet_size"]        = details.packet_size;
    statistics["samples_per_packet"] = details.samples_per_packet;
    statistics["sample_count"]       = details.sample_count;

    nlohmann::json j;
    j["media_specific"] = st2110::d30::to_json(details.audio);
    j["statistics"]     = statistics;

    return j;
}

audio_stream_details audio_stream_details::from_json(const nlohmann::json& j)
{
    audio_stream_details desc{};
    desc.audio = st2110::d30::from_json(j.at("media_specific"));

    const auto statistics_json = j.find("statistics");
    if(statistics_json != j.end())
    {
        logger()->info(statistics_json->dump());
        ::from_json(*statistics_json, static_cast<common_stream_details&>(desc));
        desc.first_sample_ts    = statistics_json->at("first_sample_ts").get<uint32_t>();
        desc.last_sample_ts     = statistics_json->at("last_sample_ts").get<uint32_t>();
        desc.packet_size        = statistics_json->at("packet_size").get<int>();
        desc.samples_per_packet = statistics_json->at("samples_per_packet").get<int>();
        desc.sample_count       = statistics_json->at("sample_count").get<uint32_t>();
    }

    return desc;
}

nlohmann::json st2110::d30::to_json(const st2110::d30::audio_description& desc)
{
    nlohmann::json j;
    j["encoding"]        = to_string(desc.encoding);
    j["sampling"]        = to_string(desc.sampling);
    j["number_channels"] = desc.number_channels;
    j["packet_time"]     = d30::to_string(desc.packet_time);

    return j;
}

st2110::d30::audio_description st2110::d30::from_json(const nlohmann::json& j)
{
    audio_description desc{};

    if(j.empty()) // media_specific was empty, using default values
        return desc;

    desc.sampling        = media::audio::parse_audio_sampling(j.at("sampling").get<string>());
    desc.encoding        = media::audio::parse_audio_encoding(j.at("encoding").get<string>());
    desc.number_channels = j.at("number_channels").get<uint8_t>();
    desc.packet_time     = st2110::d30::parse_packet_time(j.at("packet_time").get<string>());

    return desc;
}
