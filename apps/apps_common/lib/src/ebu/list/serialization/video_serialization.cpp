#include "ebu/list/serialization/video_serialization.h"

using namespace ebu_list;
using namespace std;

nlohmann::json video_stream_details::to_json(const video_stream_details& details)
{
    nlohmann::json statistics;
    statistics["first_frame_ts"] = details.first_frame_ts;
    statistics["last_frame_ts"] = details.last_frame_ts;
    statistics["is_interlaced"] = details.video.scan_type == media::video::scan_type::INTERLACED;
    statistics["max_line_number"] = details.max_line_number;
    statistics["rate"] = to_double(details.video.rate);
    statistics["packet_count"] = details.packet_count;
    statistics["dropped_packet_count"] = details.dropped_packet_count;
    statistics["frame_count"] = details.frame_count;
    statistics["first_packet_ts"] = std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count());
    statistics["last_packet_ts"] = std::to_string(chrono::duration_cast<chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count());
    statistics["packets_per_frame"] = details.video.packets_per_frame;

    nlohmann::json j;
    j["media_specific"] = st2110::d20::to_json(details.video);
    j["statistics"] = statistics;

    return j;
}

video_stream_details video_stream_details::from_json(const nlohmann::json& j)
{
    video_stream_details desc{};
    desc.video = st2110::d20::from_json(j.at("media_specific"));

    const auto statistics_json = j.find("statistics");
    if (statistics_json != j.end())
    {
        desc.first_frame_ts = statistics_json->at("first_frame_ts").get<uint32_t>();
        desc.last_frame_ts = statistics_json->at("last_frame_ts").get<uint32_t>();
        // todo: is interlaced -> maybe remove? check GUI
        desc.max_line_number = statistics_json->at("max_line_number").get<int>();
        // todo: rate -> maybe remove? check GUI
        desc.packet_count = statistics_json->at("packet_count").get<uint32_t>();
        desc.dropped_packet_count = statistics_json->at("dropped_packet_count").get<uint32_t>();
        desc.frame_count = statistics_json->at("frame_count").get<uint32_t>();
        desc.first_packet_ts = clock::time_point{ clock::duration{ std::stol(statistics_json->at("first_packet_ts").get<std::string>()) } };
        desc.last_packet_ts = clock::time_point{ clock::duration{ std::stol(statistics_json->at("last_packet_ts").get<std::string>()) } };
    }

    return desc;
}

nlohmann::json st2110::d20::to_json(const st2110::d20::video_description& desc)
{
    nlohmann::json j;
    j["rate"] = to_string(desc.rate);
    j["sampling"] = to_string(desc.sampling);
    j["color_depth"] = desc.color_depth;
    j["width"] = desc.dimensions.width;
    j["height"] = desc.dimensions.height;
    j["colorimetry"] = to_string(desc.colorimetry);
    j["scan_type"] = to_string(desc.scan_type);
    j["packets_per_frame"] = desc.packets_per_frame;
    j["schedule"] = to_string(desc.schedule);

    return j;
}

st2110::d20::video_description st2110::d20::from_json(const nlohmann::json& j)
{
    st2110::d20::video_description desc{};

    if( j.empty() ) // media_specific was empty, using default values
        return desc;

    desc.sampling = media::video::parse_video_sampling(j.at("sampling").get<string>());
    desc.color_depth = j.at("color_depth").get<uint16_t>();
    desc.dimensions = { j.at("width").get<uint16_t>(), j.at("height").get<uint16_t>() };
    desc.rate = media::video::parse_from_string(j.at("rate").get<string>());
    desc.colorimetry = media::video::parse_colorimetry(j.at("colorimetry").get<string>());
    desc.packets_per_frame = j.at("packets_per_frame").get<int>();
    desc.schedule = d21::read_schedule_from_string(j.at("schedule").get<string>());

    const auto scan_type = j.find("scan_type");
    if (scan_type != j.end())
    {
        desc.scan_type = media::video::parse_scan_type(scan_type->get<string>());
    }

    return desc;
}
