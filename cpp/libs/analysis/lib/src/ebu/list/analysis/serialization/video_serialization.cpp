#include "ebu/list/analysis/serialization/video_serialization.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace std;

nlohmann::json video_stream_details::to_json(const video_stream_details& details)
{
    nlohmann::json statistics;
    analysis::to_json(statistics, static_cast<const common_stream_details&>(details));
    statistics["first_frame_ts"]  = details.first_frame_ts;
    statistics["last_frame_ts"]   = details.last_frame_ts;
    statistics["is_interlaced"]   = details.video.scan_type == media::video::scan_type::INTERLACED;
    statistics["max_line_number"] = details.max_line_number;
    statistics["rate"]            = to_double(details.video.rate);
    statistics["frame_count"]     = details.frame_count;

    nlohmann::json j;
    j["media_specific"] = st2110::d20::to_json(details.video);
    j["statistics"]     = statistics;

    return j;
}

video_stream_details video_stream_details::from_json(const nlohmann::json& j)
{
    video_stream_details desc{};
    desc.video = st2110::d20::from_json(j.at("media_specific"));

    const auto statistics_json = j.find("statistics");
    if(statistics_json != j.end())
    {
        analysis::from_json(*statistics_json, static_cast<common_stream_details&>(desc));
        desc.first_frame_ts  = statistics_json->at("first_frame_ts").get<uint32_t>();
        desc.last_frame_ts   = statistics_json->at("last_frame_ts").get<uint32_t>();
        desc.max_line_number = statistics_json->at("max_line_number").get<int>();
        desc.frame_count     = statistics_json->at("frame_count").get<uint32_t>();
    }

    return desc;
}

nlohmann::json st2110::d20::to_json(const st2110::d20::video_description& desc)
{
    nlohmann::json j;
    j["rate"]              = to_string(desc.rate);
    j["sampling"]          = to_string(desc.sampling);
    j["color_depth"]       = desc.color_depth;
    j["width"]             = desc.dimensions.width;
    j["height"]            = desc.dimensions.height;
    j["colorimetry"]       = to_string(desc.colorimetry);
    j["scan_type"]         = to_string(desc.scan_type);
    j["packets_per_frame"] = desc.packets_per_frame;
    j["schedule"]          = to_string(desc.schedule);
    j["avg_tro_ns"]        = desc.avg_tro_ns;
    j["max_tro_ns"]        = desc.max_tro_ns;
    j["min_tro_ns"]        = desc.min_tro_ns;
    j["tro_default_ns"]    = desc.tro_default_ns;
    j["packing_mode"]      = desc.packing_mode;

    return j;
}

st2110::d20::video_description st2110::d20::from_json(const nlohmann::json& j)
{
    st2110::d20::video_description desc{};

    if(j.empty()) // media_specific was empty, using default values
        return desc;

    desc.sampling    = media::video::parse_video_sampling(j.at("sampling").get<string>());
    desc.color_depth = j.at("color_depth").get<uint16_t>();
    desc.dimensions  = {j.at("width").get<uint16_t>(), j.at("height").get<uint16_t>()};
    desc.rate        = media::video::parse_from_string(j.at("rate").get<string>());
    desc.colorimetry = media::video::parse_colorimetry(j.at("colorimetry").get<string>());

    // the following are not always populated
    const auto scan_type_json = j.find("scan_type");
    if(scan_type_json != j.end())
    {
        desc.scan_type = media::video::parse_scan_type(scan_type_json->get<string>());
    }

    const auto packets_per_frame_json = j.find("packets_per_frame");
    if(packets_per_frame_json != j.end())
    {
        desc.packets_per_frame = packets_per_frame_json->get<int>();
    }

    const auto schedule_json = j.find("schedule");
    if(schedule_json != j.end())
    {
        desc.schedule = d21::read_schedule_from_string(schedule_json->get<string>());
    }

    desc.avg_tro_ns     = j.at("avg_tro_ns").get<int64_t>();
    desc.max_tro_ns     = j.at("max_tro_ns").get<int64_t>();
    desc.min_tro_ns     = j.at("min_tro_ns").get<int64_t>();
    desc.tro_default_ns = j.at("tro_default_ns").get<int64_t>();

    const auto pm_json = j.find("packing_mode");
    if(pm_json != j.end())
    {
        desc.packing_mode = pm_json->get<packing_mode_t>();
    }

    return desc;
}
