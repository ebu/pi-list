#include "catch2/catch.hpp"
#include "ebu/list/preprocessor/stream_analyzer.h"
#include "ebu/list/test_lib/sample_files.h"

SCENARIO("ST2110-X stream identification")
{
    GIVEN("An ST2110-20 pcap file")
    {
        auto pcap_file = ebu_list::test_lib::sample_file("pcap/st2110/2110-20/2110-20_1080i5994.pcap");

        WHEN("It is analyzed")
        {
            const std::string uuid = "62df0243-7154-4d2c-b005-7e11a2b9ea38";

            nlohmann::json analysis = ebu_list::analysis::analyze_stream(pcap_file.string(), uuid);

            THEN("A video stream is found")
            {
                REQUIRE(analysis["streams"][0]["media_type"] == "video");
                // std::cout << analysis.dump(2);
            }
        }
    }

    GIVEN("An ST2110-30 pcap file")
    {
        auto pcap_file = ebu_list::test_lib::sample_file("pcap/st2110/2110-30/l24_48000_8ch_0125.pcap");

        WHEN("It is analyzed")
        {
            const std::string uuid = "62df0243-7154-4d2c-b005-7e11a2b9ea38";

            nlohmann::json analysis = ebu_list::analysis::analyze_stream(pcap_file.string(), uuid);

            THEN("An audio stream is found") { REQUIRE(analysis["streams"][0]["media_type"] == "audio"); }
        }
    }

    GIVEN("An ST2110-40 pcap file")
    {
        auto pcap_file = ebu_list::test_lib::sample_file("pcap/st2110/2110-40/2110-40_5994i.pcap");

        WHEN("It is analyzed")
        {
            const std::string uuid = "62df0243-7154-4d2c-b005-7e11a2b9ea38";

            nlohmann::json analysis = ebu_list::analysis::analyze_stream(pcap_file.string(), uuid);

            THEN("An anc stream is found") { REQUIRE(analysis["streams"][0]["media_type"] == "ancillary_data"); }
        }
    }
}
