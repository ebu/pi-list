#include "catch2/catch.hpp"
#include "ebu/list/analysis/full_analysis.h"
#include "ebu/list/analysis/serialization/ttml_stream_serializer.h"
#include "ebu/list/test_lib/sample_files.h"
#include "fs_handler_factory.h"
#include <fstream>
using namespace ebu_list;
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

    std::vector<json> load_ttml_data(path storage_folder)
    {
        const auto base_path = storage_folder / analysis::ttml::stream_serializer::ttml_files_dir_name;

        std::vector<json> entries;

        for(auto index = 0;; ++index)
        {
            const auto filename = base_path / fmt::format("{}.json", index);
            if(!std::experimental::filesystem::is_regular_file(filename)) break;
            entries.push_back(load_json(filename));
        }

        return entries;
    }
} // namespace
//------------------------------------------------------------------------------

SCENARIO("TTML stream analysis")
{
    std::vector<std::string> stream_ids;

    const auto storage_folder = path("/tmp");

    auto get_stream_info = [&stream_ids](const bool /*is_srt*/, const udp::datagram&
                                         /*first_packet*/) -> std::optional<stream_with_details> {
        auto stream_info      = serializable_stream_info{};
        stream_info.type      = media::media_type::TTML;
        stream_info.full_type = media::full_media_type::TTMLXML;
        auto details          = analysis::ttml::stream_details{};

        stream_ids.push_back(stream_info.id);

        return stream_with_details{stream_info, details};
    };

    GIVEN("a pcap file with 1 TTML stream with 1 packet per document")
    {
        const auto pcap_file = test_lib::sample_file("pcap/ttml/ttmlRTP_singlePacketDocs.pcap");
        auto pcap            = pcap_info{};

        WHEN("the file is analysed")
        {
            run_analysis(pcap_file, pcap, storage_folder, get_stream_info);

            REQUIRE(stream_ids.size() == 1);
            const auto stream = load_stream_json(storage_folder / stream_ids[0]);
            REQUIRE(stream["id"] == stream_ids[0]);
            REQUIRE(stream["state"] == to_string(stream_state::ANALYZED));
            REQUIRE(stream["statistics"]["first_packet_ts"] == "1576250230948449000");
            REQUIRE(stream["statistics"]["last_packet_ts"] == "1576250233955780000");

            const auto ttml_data_items = load_ttml_data(storage_folder / stream_ids[0]);

            const auto expected = std::vector<json>{
                {{"rtp_timestamp", "794409082"},
                 {"xml",
                  "<tt:tt xmlns:tt=\"http://www.w3.org/ns/ttml\" xmlns:xmlns=\"http://www.w3.org/XML/1998/namespace\" "
                  "xmlns:ebuttExt=\"urn:ebu:tt:extension\" xmlns:ttp=\"http://www.w3.org/ns/ttml#parameter\" "
                  "xmlns:tts=\"http://www.w3.org/ns/ttml#styling\" xmlns:ebuttm=\"urn:ebu:tt:metadata\" "
                  "ttp:timeBase=\"media\" ttp:cellResolution=\"50 30\" tts:extent=\"1920px 1080px\" "
                  "ebuttm:sequenceIdentifier=\"1a003117-a2ef-4e0f-97b1-bcd0d89d5bba\" "
                  "ebuttm:sequenceNumber=\"53673\"><tt:head><tt:metadata><ebuttm:documentMetadata><ebuttm:"
                  "documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion></ebuttm:documentMetadata></"
                  "tt:metadata><tt:styling><tt:style xml:id=\"defaultStyle\" tts:fontFamily=\"monospaceSansSerif\" "
                  "tts:fontSize=\"1c 2c\" tts:textAlign=\"center\" tts:color=\"white\" "
                  "tts:backgroundColor=\"black\"/></tt:styling><tt:layout><tt:region xml:id=\"bottom\" "
                  "tts:origin=\"10%% 10%%\" tts:extent=\"80%% 80%%\" "
                  "tts:displayAlign=\"after\"/></tt:layout></tt:head><tt:body dur=\"00:00:10\"><tt:div "
                  "style=\"defaultStyle\"><tt:p xml:id=\"sub\" region=\"bottom\"><tt:span>2019-12-13 "
                  "15:17:10.947544</tt:span></tt:p></tt:div></tt:body></tt:tt>"}},
                {{"rtp_timestamp", "794410084"},
                 {"xml",
                  "<tt:tt xmlns:tt=\"http://www.w3.org/ns/ttml\" "
                  "xmlns:xmlns=\"http://www.w3.org/XML/1998/namespace\" "
                  "xmlns:ebuttExt=\"urn:ebu:tt:extension\" xmlns:ttp=\"http://www.w3.org/ns/ttml#parameter\" "
                  "xmlns:tts=\"http://www.w3.org/ns/ttml#styling\" xmlns:ebuttm=\"urn:ebu:tt:metadata\" "
                  "ttp:timeBase=\"media\" ttp:cellResolution=\"50 30\" tts:extent=\"1920px 1080px\" "
                  "ebuttm:sequenceIdentifier=\"1a003117-a2ef-4e0f-97b1-bcd0d89d5bba\" "
                  "ebuttm:sequenceNumber=\"53674\"><tt:head><tt:metadata><ebuttm:documentMetadata><ebuttm:"
                  "documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion></ebuttm:documentMetadata></"
                  "tt:metadata><tt:styling><tt:style xml:id=\"defaultStyle\" tts:fontFamily=\"monospaceSansSerif\" "
                  "tts:fontSize=\"1c 2c\" tts:textAlign=\"center\" tts:color=\"white\" "
                  "tts:backgroundColor=\"black\"/></tt:styling><tt:layout><tt:region xml:id=\"bottom\" "
                  "tts:origin=\"10%% 10%%\" tts:extent=\"80%% 80%%\" "
                  "tts:displayAlign=\"after\"/></tt:layout></tt:head><tt:body dur=\"00:00:10\"><tt:div "
                  "style=\"defaultStyle\"><tt:p xml:id=\"sub\" region=\"bottom\"><tt:span>2019-12-13 "
                  "15:17:11.949864</tt:span></tt:p></tt:div></tt:body></tt:tt>"}},
                {{"rtp_timestamp", "794411087"},
                 {"xml",
                  "<tt:tt xmlns:tt=\"http://www.w3.org/ns/ttml\" "
                  "xmlns:xmlns=\"http://www.w3.org/XML/1998/namespace\" xmlns:ebuttExt=\"urn:ebu:tt:extension\" "
                  "xmlns:ttp=\"http://www.w3.org/ns/ttml#parameter\" "
                  "xmlns:tts=\"http://www.w3.org/ns/ttml#styling\" xmlns:ebuttm=\"urn:ebu:tt:metadata\" "
                  "ttp:timeBase=\"media\" ttp:cellResolution=\"50 30\" tts:extent=\"1920px 1080px\" "
                  "ebuttm:sequenceIdentifier=\"1a003117-a2ef-4e0f-97b1-bcd0d89d5bba\" "
                  "ebuttm:sequenceNumber=\"53675\"><tt:head><tt:metadata><ebuttm:documentMetadata><ebuttm:"
                  "documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion></ebuttm:documentMetadata></"
                  "tt:metadata><tt:styling><tt:style xml:id=\"defaultStyle\" tts:fontFamily=\"monospaceSansSerif\" "
                  "tts:fontSize=\"1c 2c\" tts:textAlign=\"center\" tts:color=\"white\" "
                  "tts:backgroundColor=\"black\"/></tt:styling><tt:layout><tt:region xml:id=\"bottom\" "
                  "tts:origin=\"10%% 10%%\" tts:extent=\"80%% 80%%\" "
                  "tts:displayAlign=\"after\"/></tt:layout></tt:head><tt:body dur=\"00:00:10\"><tt:div "
                  "style=\"defaultStyle\"><tt:p xml:id=\"sub\" region=\"bottom\"><tt:span>2019-12-13 "
                  "15:17:12.952108</tt:span></tt:p></tt:div></tt:body></tt:tt>"}},
                {{"rtp_timestamp", "794412089"},
                 {"xml",
                  "<tt:tt xmlns:tt=\"http://www.w3.org/ns/ttml\" xmlns:xmlns=\"http://www.w3.org/XML/1998/namespace\" "
                  "xmlns:ebuttExt=\"urn:ebu:tt:extension\" xmlns:ttp=\"http://www.w3.org/ns/ttml#parameter\" "
                  "xmlns:tts=\"http://www.w3.org/ns/ttml#styling\" xmlns:ebuttm=\"urn:ebu:tt:metadata\" "
                  "ttp:timeBase=\"media\" ttp:cellResolution=\"50 30\" tts:extent=\"1920px 1080px\" "
                  "ebuttm:sequenceIdentifier=\"1a003117-a2ef-4e0f-97b1-bcd0d89d5bba\" "
                  "ebuttm:sequenceNumber=\"53676\"><tt:head><tt:metadata><ebuttm:documentMetadata><ebuttm:"
                  "documentEbuttVersion>v1.0</ebuttm:documentEbuttVersion></ebuttm:documentMetadata></"
                  "tt:metadata><tt:styling><tt:style xml:id=\"defaultStyle\" tts:fontFamily=\"monospaceSansSerif\" "
                  "tts:fontSize=\"1c 2c\" tts:textAlign=\"center\" tts:color=\"white\" "
                  "tts:backgroundColor=\"black\"/></tt:styling><tt:layout><tt:region xml:id=\"bottom\" "
                  "tts:origin=\"10%% 10%%\" tts:extent=\"80%% 80%%\" "
                  "tts:displayAlign=\"after\"/></tt:layout></tt:head><tt:body dur=\"00:00:10\"><tt:div "
                  "style=\"defaultStyle\"><tt:p xml:id=\"sub\" region=\"bottom\"><tt:span>2019-12-13 "
                  "15:17:13.954493</tt:span></tt:p></tt:div></tt:body></tt:tt>"}}};

            REQUIRE(expected == ttml_data_items);
        }
    }

    GIVEN("a pcap file with 1 TTML stream with 4 packets per document")
    {
        const auto pcap_file = test_lib::sample_file("pcap/ttml/ttmlRTP_fourPacketDocs.pcap");
        auto pcap            = pcap_info{};

        WHEN("the file is analysed")
        {
            run_analysis(pcap_file, pcap, storage_folder, get_stream_info);

            REQUIRE(stream_ids.size() == 1);
            const auto stream = load_stream_json(storage_folder / stream_ids[0]);
            REQUIRE(stream["id"] == stream_ids[0]);
            REQUIRE(stream["state"] == to_string(stream_state::ANALYZED));
            REQUIRE(stream["statistics"]["first_packet_ts"] == "1576249998818743000");
            REQUIRE(stream["statistics"]["last_packet_ts"] == "1576250000824328000");

            const auto ttml_data_items = load_ttml_data(storage_folder / stream_ids[0]);
            REQUIRE(ttml_data_items.size() == 3);
        }
    }

    GIVEN("a pcap file with a truncated document at the start")
    {
        const auto pcap_file = test_lib::sample_file("pcap/ttml/ttmlRTP_truncated_start.pcap");
        auto pcap            = pcap_info{};

        WHEN("the file is analysed")
        {
            run_analysis(pcap_file, pcap, storage_folder, get_stream_info);

            REQUIRE(stream_ids.size() == 1);
            const auto stream = load_stream_json(storage_folder / stream_ids[0]);
            REQUIRE(stream["id"] == stream_ids[0]);
            REQUIRE(stream["state"] == to_string(stream_state::ANALYZED));
            REQUIRE(stream["statistics"]["first_packet_ts"] == "1576249998818908000");
            REQUIRE(stream["statistics"]["last_packet_ts"] == "1576250000824328000");

            const auto ttml_data_items = load_ttml_data(storage_folder / stream_ids[0]);
            REQUIRE(ttml_data_items.size() == 3);
        }
    }
}
