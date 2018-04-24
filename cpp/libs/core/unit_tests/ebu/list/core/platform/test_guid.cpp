/*
The MIT License (MIT)

Copyright (c) 2014 Graeme Hill (http://graemehill.ca)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
Slightly adapted by Pedro Ferreira (pedro@bisect.pt)
*/
#include "pch.h"

#include "ebu/list/core/platform/guid.h"
#include "catch.hpp"

using namespace ebu_list;

//------------------------------------------------------------------------------

TEST_CASE("GUID - Happy path tests")
{
    /*************************************************************************
    * HAPPY PATH TESTS
    *************************************************************************/

    auto r1 = newGuid();
    auto r2 = newGuid();
    auto r3 = newGuid();


    REQUIRE(r1 != r2);
    REQUIRE(r1 != r3);
    REQUIRE(r2 != r3);
    REQUIRE(r1.is_valid());
    REQUIRE(r2.is_valid());
    REQUIRE(r3.is_valid());

    guid s1("7bcd757f-5b10-4f9b-af69-1a1f226f3b3e");
    guid s2("16d1bd03-09a5-47d3-944b-5e326fd52d27");
    guid s3("fdaba646-e07e-49de-9529-4499a5580c75");
    guid s4("7bcd757f-5b10-4f9b-af69-1a1f226f3b3e");
    REQUIRE(s1 != s2);
    REQUIRE(s1 == s4);
    REQUIRE(s1.is_valid());
    REQUIRE(s2.is_valid());
    REQUIRE(s3.is_valid());
    REQUIRE(s4.is_valid());


    std::stringstream ss1;
    ss1 << s1;
    REQUIRE(ss1.str() == "7bcd757f-5b10-4f9b-af69-1a1f226f3b3e");
    REQUIRE(s1.str() == "7bcd757f-5b10-4f9b-af69-1a1f226f3b3e");

    std::stringstream ss2;
    ss2 << s2;
    REQUIRE(ss2.str() == "16d1bd03-09a5-47d3-944b-5e326fd52d27");

    std::stringstream ss3;
    ss3 << s3;
    REQUIRE(ss3.str() == "fdaba646-e07e-49de-9529-4499a5580c75");

    auto swap1 = newGuid();
    auto swap2 = newGuid();
    auto swap3 = swap1;
    auto swap4 = swap2;
    REQUIRE(swap1.is_valid());
    REQUIRE(swap2.is_valid());
    REQUIRE(swap3.is_valid());
    REQUIRE(swap4.is_valid());

    REQUIRE(swap1 == swap3);
    REQUIRE(swap2 == swap4);
    REQUIRE(swap1 != swap2);

    swap1.swap(swap2);
    REQUIRE(swap1.is_valid());
    REQUIRE(swap2.is_valid());

    REQUIRE(swap1 == swap4);
    REQUIRE(swap2 == swap3);
    REQUIRE(swap1 != swap2);

    std::array<unsigned char, 16> bytes =
    {
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
        0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0xdd
    };
    guid guidFromBytes(bytes);
    guid guidFromString("0102030405060708090a0b0c0d0e0fdd");
    REQUIRE(guidFromBytes == guidFromString);
    REQUIRE(guidFromString.is_valid());
    REQUIRE(guidFromBytes.is_valid());

    REQUIRE(std::equal(guidFromBytes.bytes().begin(), guidFromBytes.bytes().end(), bytes.begin()));

    /*************************************************************************
    * ERROR HANDLING
    *************************************************************************/

    guid empty;
    guid twoTooFew("7bcd757f-5b10-4f9b-af69-1a1f226f3b");
    REQUIRE(twoTooFew == empty);
    REQUIRE(!twoTooFew.is_valid());

    guid oneTooFew("16d1bd03-09a5-47d3-944b-5e326fd52d2");
    REQUIRE(oneTooFew == empty);
    REQUIRE(!oneTooFew.is_valid());

    guid twoTooMany("7bcd757f-5b10-4f9b-af69-1a1f226f3beeff");
    REQUIRE(twoTooMany == empty);
    REQUIRE(!twoTooMany.is_valid());

    guid oneTooMany("16d1bd03-09a5-47d3-944b-5e326fd52d27a");
    REQUIRE(oneTooMany == empty);
    REQUIRE(!oneTooMany.is_valid());

    guid badString("!!bad-guid-string!!");
    REQUIRE(badString == empty);
    REQUIRE(!badString.is_valid());
}
