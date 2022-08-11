#include "catch2/catch.hpp"
#include "ebu/list/srt/srt_format_detector.h"
#include "ebu/list/test_lib/sample_files.h"
#include "udp_source.h"
#include "utils.h"

using namespace ebu_list;
using namespace ebu_list::srt;
using namespace ebu_list::test;
using namespace ebu_list::st2110;
//------------------------------------------------------------------------------

SCENARIO("SRT heuristics")
{
    GIVEN("a SRT stream")
    {
        const auto pcap_file = test_lib::sample_file("pcap/srt/srt_stream.pcap");
        udp_source source(pcap_file);

        srt_format_detector detector;
        const auto result = test::run_srt_format_detector(detector, source);

        WHEN("we check the status")
        {
            THEN("it is valid")
            {
                REQUIRE(result.state == detector::state::valid);
            }
        }
    }
}
