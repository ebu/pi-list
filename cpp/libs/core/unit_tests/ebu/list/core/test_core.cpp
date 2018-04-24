#include "pch.h"

#include "ebu/list/version.h"
#include "catch.hpp"

using namespace ebu_list;

//------------------------------------------------------------------------------

TEST_CASE("See if version is present")
{
    REQUIRE(version() == std::to_string(version_major) + '.' +
        std::to_string(version_minor) + '.' +
        std::to_string(version_patch));
}

//------------------------------------------------------------------------------
