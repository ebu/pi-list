#include "catch2/catch.hpp"
#include "ebu/list/analysis/analysis_profile.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using nlohmann::json;

SCENARIO("Analysis profile serialization")
{
    GIVEN("a JSON string with a profile")
    {
        const auto j       = R"({
        "id": "5b2203b2-0aec-40fa-b0da-2f36a1c06af6",
        "label": "JT-NM Tested",
        "timestamps": {
            "source": "pcap"
        }
    })"_json;
        const auto profile = j.get<analysis_profile>();
        WHEN("the string is deserialized")
        {
            THEN("the profile is correct")
            {
                REQUIRE(profile.id == "5b2203b2-0aec-40fa-b0da-2f36a1c06af6");
                REQUIRE(profile.label == "JT-NM Tested");
                REQUIRE(profile.timestamps.source == timestamps_source::pcap);
            }
        }
    }

    GIVEN("a JSON string with a profile")
    {
        const auto j       = R"({
        "id": "b89d08b5-0dc8-4860-b5d5-32d2a051957e",
        "label": "JT-NM Tested",
        "timestamps": {
            "source": "ptp_packets"
        }
    })"_json;
        const auto profile = j.get<analysis_profile>();
    WHEN("the string is deserialized")
    {
        THEN("the profile is correct")
        {
            REQUIRE(profile.id == "b89d08b5-0dc8-4860-b5d5-32d2a051957e");
            REQUIRE(profile.label == "JT-NM Tested");
            REQUIRE(profile.timestamps.source == timestamps_source::ptp_packets);
        }
    }
}
}
