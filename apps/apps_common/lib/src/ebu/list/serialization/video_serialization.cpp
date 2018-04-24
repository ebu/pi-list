#include "ebu/list/serialization/video_serialization.h"

using namespace ebu_list;
using namespace std;

nlohmann::json ebu_list::to_json(const video_stream_details& details)
{
    nlohmann::json statistics;
    statistics["first_frame_ts"] = details.first_frame_ts;
    statistics["last_frame_ts"] = details.last_frame_ts;
    statistics["is_interlaced"] = details.video.scan_type == media::video::scan_type::INTERLACED;
    statistics["max_line_number"] = details.max_line_number;
    statistics["rate"] = details.video.rate.to_float();
    statistics["packet_count"] = details.packet_count;
    statistics["frame_count"] = details.frame_count;
    statistics["first_packet_ts"] = std::chrono::duration_cast<std::chrono::nanoseconds>(details.first_packet_ts.time_since_epoch()).count();
    statistics["last_packet_ts"] = std::chrono::duration_cast<std::chrono::nanoseconds>(details.last_packet_ts.time_since_epoch()).count();
    statistics["packets_per_frame"] = details.video.packets_per_frame;

    nlohmann::json j;
    j["media_specific"] = st2110::d20::to_json(details.video);
    j["statistics"] = statistics;

    return j;
}

video_stream_details ebu_list::parse_video_json(const nlohmann::json& j)
{
    video_stream_details desc{};
    desc.video = st2110::d20::from_json(j);

    const auto ppf = j.find("packets_per_frame");
    if (ppf != j.end())
    {
        desc.video.packets_per_frame = j.at("packets_per_frame").get<int>();
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
    j["rate"] = to_string(desc.rate);
    j["colorimetry"] = to_string(desc.colorimetry);
    j["scan_type"] = to_string(desc.scan_type);

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

    const auto scan_type = j.find("scan_type");
    if (scan_type != j.end())
    {
        desc.scan_type = media::video::parse_scan_type(scan_type->get<string>());
    }

    return desc;
}
