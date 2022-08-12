#include "catch2/catch.hpp"
#include "ebu/list/st2110/d20/header.h"
using namespace ebu_list;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------

SCENARIO("ST2110-30 header")
{
    GIVEN("a microsecond resolution pcap file")
    {
        WHEN("we read its header")
        {
            THEN("we get the correct header information")
            {
            }
        }
    }
}
