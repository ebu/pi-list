#include "pch.h"

#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/test_lib/sample_files.h"
#include "catch.hpp"

using namespace ebu_list;

//------------------------------------------------------------------------------
// Static tests
static_assert(!std::is_default_constructible_v<file_source>);
static_assert(!std::is_copy_constructible_v<file_source>);
static_assert(!std::is_copy_assignable_v<file_source>);

// TODO:
static_assert(!std::is_move_constructible_v<file_source>);
static_assert(!std::is_move_assignable_v<file_source>);

//------------------------------------------------------------------------------
SCENARIO("Open a file")
{
    auto f = std::make_shared<malloc_sbuffer_factory>();

    GIVEN("a valid path")
    {
        WHEN("we create a file_source")
        {
            THEN("it opens the file")
            {
                const auto p = test_lib::sample_file("unit_tests/core/io/f1.bin");
                file_source source(f, p.generic_u8string().c_str());
            }
        }
    }

    GIVEN("an invalid path")
    {
        WHEN("we create a file_source")
        {
            THEN("it throws")
            {
                const auto p = test_lib::sample_file("an_invalid_path.bin");
                auto l = [&]() { file_source source(f, p.generic_u8string().c_str()); };
                REQUIRE_THROWS(l());
            }
        }
    }
}
