#include "ebu/list/serialization/pcap.h"

using namespace ebu_list;

nlohmann::json pcap_info::to_json(const pcap_info& info)
{
    nlohmann::json j;
    j["id"] = info.id;
    j["file_name"] = info.filename;
    j["pcap_file_name"] = info.pcap_file_name;
    j["date"] = std::chrono::duration_cast<std::chrono::milliseconds>(info.date.time_since_epoch()).count();
    j["analyzed"] = info.analyzed;
    j["offset_from_ptp_clock"] = std::chrono::duration_cast<std::chrono::nanoseconds>(info.offset_from_ptp_clock).count();
    j["video_streams"] = info.video_streams;
    j["audio_streams"] = info.audio_streams;
    j["anc_streams"] = info.anc_streams;
    j["total_streams"] = info.total_streams;
    j["wide_streams"] = info.wide_streams;
    j["narrow_streams"] = info.narrow_streams;
    j["narrow_linear_streams"] = info.narrow_linear_streams;
    j["not_compliant_streams"] = info.not_compliant_streams;

    return j;
}

pcap_info pcap_info::from_json(const nlohmann::json& j)
{
    pcap_info pcap;
    pcap.id = j.at("id").get<std::string>();
    pcap.filename = j.at("file_name").get<std::string>();
    pcap.pcap_file_name = j.at("pcap_file_name").get<std::string>();
    const auto duration = std::chrono::duration<clock::rep, std::milli>(j.at("date").get<clock::rep>());
    pcap.date = std::chrono::system_clock::time_point(duration);
    pcap.analyzed = j.at("analyzed").get<bool>();
    const auto ptp_offset_ns = j.at("offset_from_ptp_clock").get<uint64_t>();
    pcap.offset_from_ptp_clock = std::chrono::nanoseconds{ ptp_offset_ns };
    pcap.video_streams = j.at("video_streams").get<int>();
    pcap.audio_streams = j.at("audio_streams").get<int>();
    pcap.total_streams = j.at("total_streams").get<int>();
    pcap.wide_streams = j.at("wide_streams").get<int>();
    pcap.narrow_streams = j.at("narrow_streams").get<int>();
    pcap.narrow_linear_streams = j.at("narrow_linear_streams").get<int>();
    pcap.not_compliant_streams = j.at("not_compliant_streams").get<int>();

    return pcap;
}
