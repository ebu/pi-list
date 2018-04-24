#include "pch.h"

#include "ebu/list/pcap/reader.h"
#include "ebu/list/test_lib/sample_files.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/core/io/file_source.h"
#include "catch.hpp"
using namespace ebu_list;
using namespace ebu_list::pcap;

//------------------------------------------------------------------------------

SCENARIO("pcap header")
{
    auto bf = std::make_shared<malloc_sbuffer_factory>();

    GIVEN("a microsecond resolution pcap file")
    {
        auto pcap_file = test_lib::sample_file("pcap/ptp/PTP_at_clock.pcap");
        chunked_data_source source(bf, std::make_unique<file_source>(bf, pcap_file));

        WHEN("we read its header")
        {
            auto maybe_header = read_header(source);

            THEN("we get the correct header information")
            {
                REQUIRE(maybe_header);

                const auto h = maybe_header.value().view();
                REQUIRE(h.is_valid());
                REQUIRE_FALSE(h.is_nanosecond());
            }
        }
    }

    GIVEN("a nanosecond resolution pcap file")
    {
        auto pcap_file = test_lib::sample_file("pcap/ptp/PTP_clock.pcap");
        chunked_data_source source(bf, std::make_unique<file_source>(bf, pcap_file));

        WHEN("we read its header")
        {
            auto maybe_header = read_header(source);

            THEN("we get the correct header information")
            {
                REQUIRE(maybe_header);

                const auto h = maybe_header.value().view();
                REQUIRE(h.is_valid());
                REQUIRE(h.is_nanosecond());
            }
        }
    }
}

SCENARIO("pcap packets")
{
    auto bf = std::make_shared<malloc_sbuffer_factory>();

    GIVEN("a microsecond resolution pcap file")
    {
        auto pcap_file = test_lib::sample_file("pcap/ptp/PTP_at_clock.pcap");
        chunked_data_source source(bf, std::make_unique<file_source>(bf, pcap_file));
        auto maybe_header = read_header(source);
        REQUIRE(maybe_header);
        const auto h = maybe_header.value().view();
        REQUIRE(h.is_valid());

        WHEN("we read its first packet")
        {
            auto maybe_packet = read_packet(h, source);

            THEN("we get the correct header information")
            {
                REQUIRE(maybe_packet);
                constexpr auto expected_d = clock::time_point(std::chrono::duration_cast<typename clock::duration>(std::chrono::nanoseconds(1445454185533268000)));
                REQUIRE(maybe_packet.value().pcap_header().timestamp() == expected_d);
            }
        }
    }

    GIVEN("a nanosecond resolution pcap file")
    {
        auto pcap_file = test_lib::sample_file("pcap/ptp/PTP_clock.pcap");
        chunked_data_source source(bf, std::make_unique<file_source>(bf, pcap_file));
        auto maybe_header = read_header(source);
        REQUIRE(maybe_header);
        const auto h = maybe_header.value().view();
        REQUIRE(h.is_valid());

        WHEN("we read its first packet")
        {
            auto maybe_packet = read_packet(h, source);

            THEN("we get the correct header information")
            {
                REQUIRE(maybe_packet);
                constexpr auto expected_d = clock::time_point(std::chrono::duration_cast<typename clock::duration>(std::chrono::nanoseconds(1486566127765647489)));
                REQUIRE(maybe_packet.value().pcap_header().timestamp() == expected_d);
            }
        }
    }
}
