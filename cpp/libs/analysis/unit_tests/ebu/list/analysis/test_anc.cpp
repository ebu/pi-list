#include "catch2/catch.hpp"
#include "ebu/list/analysis/full_analysis.h"
#include "ebu/list/test_lib/sample_files.h"
#include "fs_handler_factory.h"
#include <fstream>

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::analysis;
using json = nlohmann::json;

//------------------------------------------------------------------------------
namespace
{
    template <typename InfoGetter>
    void run_analysis(const path& pcap_file, pcap_info& pcap, const path& storage_folder, InfoGetter get_stream_info)
    {
        fs_handler_factory handler_factory(storage_folder);
        fs_updater updater(storage_folder);
        analysis_profile profile;
        profile.timestamps.source = timestamps_source::pcap;
        auto callback             = [](float) {};

        constexpr auto is_srt = false;
        auto context = processing_context{pcap_file,        profile,  storage_folder, pcap, get_stream_info,
                                          &handler_factory, &updater, callback,       false, is_srt};

        run_full_analysis(context);
    }

    json load_json(path full_path)
    {
        std::ifstream ifs(full_path);
        LIST_ENFORCE(ifs.is_open() && !ifs.fail(), std::runtime_error, "{} not found", full_path.string());
        return json::parse(ifs);
    }

    json load_stream_json(path storage_folder)
    {
        const auto full_path = storage_folder / "stream.json";
        return load_json(full_path);
    }
} // namespace
//------------------------------------------------------------------------------

SCENARIO("Ancillary stream analysis")
{
    std::vector<std::string> stream_ids;

    auto get_stream_info = [&stream_ids](const bool /*is_srt*/, const udp::datagram&
                                         /*first_packet*/) -> std::optional<stream_with_details> {
        auto stream_info      = serializable_stream_info{};
        stream_info.type      = media::media_type::ANCILLARY_DATA;
        stream_info.full_type = media::full_media_type::SMPTE291;
        auto details          = anc_stream_details{};
        details.anc.rate      = fraction64(60); // not happy with default 0 denominator
        details.anc.scan_type = video::scan_type::INTERLACED;

        stream_ids.push_back(stream_info.id);

        return stream_with_details{stream_info, details};
    };

    GIVEN("a pcap file a with error: 2 wrong bit markers, 2 wrong fields")
    {
        const auto pcap_file = test_lib::sample_file("pcap/st2110/2110-40/anc_with_wrong_2markers_and_2fields.pcap");
        const auto storage_folder = path("/tmp");
        auto pcap                 = pcap_info{};

        WHEN("the file is analysed")
        {
            run_analysis(pcap_file, pcap, storage_folder, get_stream_info);

            REQUIRE(stream_ids.size() == 1);
            const auto stream = load_stream_json(storage_folder / stream_ids[0]);
            REQUIRE(stream["id"] == stream_ids[0]);
            REQUIRE(stream["state"] == to_string(stream_state::ANALYZED));
            REQUIRE(stream["statistics"]["wrong_marker_count"] == 2);
            REQUIRE(stream["statistics"]["wrong_field_count"] == 4);
        }
    }

    GIVEN("a pcap file a with errors: 1 unknown DID/SDID, and 2 payload bytes")
    {
        const auto pcap_file      = test_lib::sample_file("pcap/st2110/2110-40/anc_with_wrong_DID_and_payload.pcap");
        const auto storage_folder = path("/tmp");
        auto pcap                 = pcap_info{};

        WHEN("the file is analysed")
        {
            run_analysis(pcap_file, pcap, storage_folder, get_stream_info);

            REQUIRE(stream_ids.size() == 1);
            const auto stream = load_stream_json(storage_folder / stream_ids[0]);
            REQUIRE(stream["id"] == stream_ids[0]);
            REQUIRE(stream["state"] == to_string(stream_state::ANALYZED));
            REQUIRE(stream["statistics"]["payload_error_count"] == 3);
        }
    }
}
