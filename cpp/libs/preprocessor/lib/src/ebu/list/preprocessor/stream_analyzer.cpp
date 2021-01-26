#include "ebu/list/preprocessor/stream_analyzer.h"
#include "ebu/list/analysis/serialization/pcap.h"
#include "ebu/list/core/platform/parallel.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/ptp/ptp_offset_calculator.h"
#include "ebu/list/ptp/udp_filter.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/version.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::ptp;
using nlohmann::json;

namespace
{
    json make_pcap_info(const path& pcap_file, std::string_view pcap_uuid, clock::time_point capture_timestamp,
                        bool has_truncated_packets, const std::optional<ptp_offset_calculator::info>& ptp_info)
    {
        auto info                  = pcap_info{};
        info.id                    = pcap_uuid;
        info.filename              = pcap_file.filename().string();
        info.analyzer_version      = ebu_list::version();
        info.truncated             = has_truncated_packets;
        info.offset_from_ptp_clock = ptp_info.has_value() ? ptp_info->average_offset : std::chrono::seconds{0};
        info.capture_timestamp     = capture_timestamp;

        auto j_fi = pcap_info::to_json(info);

        if(ptp_info.has_value())
        {
            j_fi["ptp"] = json::object();

            if(ptp_info->is_two_step) j_fi["ptp"]["is_two_step"] = ptp_info->is_two_step.value();
            if(ptp_info->master_id) j_fi["ptp"]["master_id"] = ptp::v2::to_string(ptp_info->master_id.value());
            if(ptp_info->grandmaster_id)
                j_fi["ptp"]["grandmaster_id"] = ptp::v2::to_string(ptp_info->grandmaster_id.value());
            j_fi["ptp"]["average_offset"] =
                std::chrono::duration_cast<std::chrono::nanoseconds>(ptp_info->average_offset).count();
        }

        return j_fi;
    }
} // namespace

nlohmann::json ebu_list::analysis::analyze_stream(const std::string_view& pcap_file, const std::string_view& pcap_uuid)
{
    // These will hold pointers to the stream handlers.
    // They will, however, be owned by the udp_handler, so we cannot access these after the stream handler is
    // destroyed.
    std::vector<stream_listener*> streams;
    clock::time_point capture_timestamp = {};

    auto create_handler = [&capture_timestamp, &streams, pcap_uuid](rtp::packet first_packet) {
        capture_timestamp = first_packet.info.udp.packet_time;
        auto listener     = std::make_unique<stream_listener>(first_packet, pcap_uuid);
        streams.push_back(listener.get());
        return listener;
    };

    auto offset_calculator = std::make_shared<ptp::ptp_offset_calculator>();
    auto udp_handler       = std::make_shared<rtp::udp_handler>(create_handler);
    auto filter            = std::make_shared<ptp::udp_filter>(offset_calculator, udp_handler);
    auto player            = std::make_unique<pcap::pcap_player>(path(pcap_file), filter, on_error_exit);

    const auto start_time = std::chrono::steady_clock::now();

    auto launcher = launch(std::move(player));

    launcher.wait();

    const auto end_time        = std::chrono::steady_clock::now();
    const auto processing_time = end_time - start_time;
    const auto processing_time_ms =
        static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
    logger()->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);

    auto j_pcap_info = make_pcap_info(pcap_file, pcap_uuid, capture_timestamp,
                                      launcher.target().pcap_has_truncated_packets(), offset_calculator->get_info());

    json j_info;
    j_info["pcap"] = j_pcap_info;
    json j_streams = json::array();

    std::transform(begin(streams), end(streams), std::back_inserter(j_streams),
                   [&](const stream_listener* stream) { return stream->get_info(); });

    j_info["streams"] = j_streams;

    return j_info;
}
