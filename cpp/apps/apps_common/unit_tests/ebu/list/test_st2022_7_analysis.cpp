#include "catch2/catch.hpp"
#include "ebu/list/st2022_7/analysis.h"
#include "ebu/list/test_lib/sample_files.h"
using namespace ebu_list;
using nlohmann::json;

//------------------------------------------------------------------------------

namespace
{
    struct group_1
    {
        static constexpr auto pcap_file                    = "pcap/st2110/2022-7/ST2022-7-Audio.pcap";
        static constexpr auto total_number_of_packets      = 16000 + 16000;
        static constexpr auto intersection_size_in_packets = 15999 * 2;
        static constexpr auto missing_packets              = 0;
        static constexpr auto different_packets            = 0;
        static constexpr auto avgDeltaNs                   = 28.184153733216878L;
        static constexpr auto maxDeltaNs                   = 52.0L;
        static constexpr auto minDeltaNs                   = 0.0L;

        static json get_a()
        {
            json a                                          = json::object();
            a["pcap_file"]                                  = test_lib::sample_file(pcap_file);
            a["network_information"]                        = json::object();
            a["network_information"]["destination_address"] = "239.1.2.1";
            a["network_information"]["destination_port"]    = "6000";
            a["network_information"]["source_address"]      = "192.168.120.2";
            a["media_type"]                                 = "audio";

            return a;
        }

        static json get_b()
        {
            json b                                          = json::object();
            b["pcap_file"]                                  = test_lib::sample_file(pcap_file);
            b["network_information"]                        = json::object();
            b["network_information"]["destination_address"] = "239.1.2.2";
            b["network_information"]["destination_port"]    = "6000";
            b["network_information"]["source_address"]      = "192.168.130.2";
            b["media_type"]                                 = "audio";

            return b;
        }
    };

    struct group_2
    {
        static constexpr auto pcap_file                    = "pcap/st2110/2022-7/ST2022-7-Audio_dropped_in_both.pcap";
        static constexpr auto total_number_of_packets      = 374;
        static constexpr auto intersection_size_in_packets = 370;
        static constexpr auto missing_packets              = 12;
        static constexpr auto different_packets            = 2;
        static constexpr auto avgDeltaNs                   = 28.25660549659042L;
        static constexpr auto maxDeltaNs                   = 52.0L;
        static constexpr auto minDeltaNs                   = 0.0L;

        static json get_a()
        {
            json a                                          = json::object();
            a["pcap_file"]                                  = test_lib::sample_file(pcap_file);
            a["network_information"]                        = json::object();
            a["network_information"]["destination_address"] = "239.1.2.1";
            a["network_information"]["destination_port"]    = "6000";
            a["network_information"]["source_address"]      = "192.168.120.2";
            a["media_type"]                                 = "audio";

            return a;
        }

        static json get_b()
        {
            json b                                          = json::object();
            b["pcap_file"]                                  = test_lib::sample_file(pcap_file);
            b["network_information"]                        = json::object();
            b["network_information"]["destination_address"] = "239.1.2.2";
            b["network_information"]["destination_port"]    = "6000";
            b["network_information"]["source_address"]      = "192.168.130.2";
            b["media_type"]                                 = "audio";

            return b;
        }
    };

    //------------------------------------------------------------------------------
    template <typename Group> void check_result(const json& result)
    {
        REQUIRE(result["succeeded"] == true);
        REQUIRE(result["analysis"]["totalNumberOfPackets"] == Group::total_number_of_packets);
        REQUIRE(result["analysis"]["intersectionSizeInPackets"] == Group::intersection_size_in_packets);
        REQUIRE(result["analysis"]["numberOfMissingPackets"] == Group::missing_packets);
        REQUIRE(result["analysis"]["numberOfDifferentPackets"] == Group::different_packets);
        REQUIRE(result["analysis"]["averageDeltaNs"] == Approx(Group::avgDeltaNs));
        REQUIRE(result["analysis"]["minDeltaNs"] == Approx(Group::minDeltaNs));
        REQUIRE(result["analysis"]["maxDeltaNs"] == Approx(Group::maxDeltaNs));
    }
} // namespace

//------------------------------------------------------------------------------

SCENARIO("Analyze 2022-7")
{
    GIVEN("1 pcap file with 2 streams")
    {
        WHEN("we compare both streams")
        {
            auto config         = json::object();
            config["reference"] = group_1::get_a();
            config["main"]      = group_1::get_b();

            const auto result = st2022_7::analyse(config);
            THEN("the result is correct")
            {
                check_result<group_1>(result);
            }
        }

        WHEN("we reverse the streams")
        {
            auto config         = json::object();
            config["reference"] = group_1::get_b();
            config["main"]      = group_1::get_a();

            const auto result = st2022_7::analyse(config);
            THEN("the result is correct")
            {
                check_result<group_1>(result);
            }
        }
    }

    GIVEN("1 pcap file with 2 streams with dropped packets")
    {
        WHEN("we compare both streams")
        {
            auto config         = json::object();
            config["reference"] = group_2::get_a();
            config["main"]      = group_2::get_b();

            const auto result = st2022_7::analyse(config);
            THEN("the result is correct")
            {
                check_result<group_2>(result);
            }
        }

        WHEN("we reverse the streams")
        {
            auto config         = json::object();
            config["reference"] = group_2::get_b();
            config["main"]      = group_2::get_a();

            const auto result = st2022_7::analyse(config);
            THEN("the result is correct")
            {
                check_result<group_2>(result);
            }
        }
    }
}
