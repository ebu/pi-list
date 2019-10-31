#include "pch.h"

#include "catch2/catch.hpp"
#include "ebu/list/core/math/fraction.h"

using namespace ebu_list;

//------------------------------------------------------------------------------

SCENARIO("Fraction is created")
{
    GIVEN("a simple fraction")
    {
        fraction f(4, 2);

        WHEN("we try to get the fraction value")
        {
            auto value = to_double(f);

            THEN("we get the right value") { REQUIRE(value == 2); }
        }

        WHEN("we build an equivalent fraction")
        {
            fraction f2(2, 1);

            THEN("they represent the same value") { REQUIRE(f == f2); }

            THEN("they have the same numerator")
            {
                const auto num_1 = f.numerator();
                const auto num_2 = f2.numerator();
                REQUIRE(num_1 == num_2);
            }

            THEN("they have the same denominator")
            {
                const auto den_1 = f.denominator();
                const auto den_2 = f2.denominator();
                REQUIRE(den_1 == den_2);
            }
        }
    }

    GIVEN("a not so simple fraction")
    {
        fraction f(3, 4);

        WHEN("we try to get the fraction value")
        {
            auto value = to_double(f);

            THEN("we get the right value") { REQUIRE(value == 0.75); }
        }

        WHEN("we try to get the numerator")
        {
            auto numerator = f.numerator();

            THEN("we get the right value") { REQUIRE(numerator == 3); }
        }

        WHEN("we try to get the denominator")
        {
            auto denominator = f.denominator();

            THEN("we get the right value") { REQUIRE(denominator == 4); }
        }
    }

    GIVEN("an invalid denominator_")
    {
        WHEN("we build the fraction")
        {
            THEN("we get an exception thrown") { REQUIRE_THROWS_AS(fraction(1, 0), std::domain_error); }
        }
    }

    GIVEN("a float number")
    {
        fraction f(0.75);

        WHEN("we try to get the fraction value")
        {
            auto value = to_double(f);

            THEN("we get the right value") { REQUIRE(value == 0.75); }
        }

        WHEN("we build an equivalent fraction")
        {
            fraction f2(3, 4);

            THEN("they represent the same value") { REQUIRE(f == f2); }

            THEN("they have the same numerator")
            {
                const auto num_1 = f.numerator();
                const auto num_2 = f2.numerator();
                REQUIRE(num_1 == num_2);
            }

            THEN("they have the same denominator")
            {
                const auto den_1 = f.denominator();
                const auto den_2 = f2.denominator();
                REQUIRE(den_1 == den_2);
            }
        }
    }
}

SCENARIO("Operations over fraction abstraction")
{
    GIVEN("two positive fractions")
    {
        fraction f1(4, 2);
        fraction f2(1, 2);

        WHEN("we sum them")
        {
            const auto result = f1 + f2;

            THEN("we get the right value") { REQUIRE(fraction(5, 2) == result); }

            THEN("the operation is commutative")
            {
                const auto result2 = f2 + f1;
                REQUIRE(fraction(5, 2) == result);
                REQUIRE(fraction(5, 2) == result2);
                REQUIRE(result2 == result);
            }
        }

        WHEN("we subtract them")
        {
            const auto result = f1 - f2;

            THEN("we get the right value") { REQUIRE(fraction(3, 2) == result); }
        }

        WHEN("we multiply them")
        {
            const auto result = f1 * f2;

            THEN("we get the right value")
            {
                REQUIRE(fraction(4, 4) == result);
                REQUIRE(fraction(1, 1) == result);
            }

            THEN("the operation is commutative")
            {
                const auto result2 = f2 * f1;
                REQUIRE(fraction(4, 4) == result);
                REQUIRE(fraction(4, 4) == result2);
                REQUIRE(result2 == result);
            }
        }

        WHEN("we divide them")
        {
            const auto result = f1 / f2;

            THEN("we get the right value")
            {
                REQUIRE(fraction(8, 2) == result);
                REQUIRE(fraction(4, 1) == result);
            }
        }

        WHEN("we convert them to a string representation")
        {
            const auto f1_string = to_string(f1);
            const auto f2_string = to_string(f2);

            THEN("we get a single digit if denominator is 1") { REQUIRE("2" == f1_string); }

            THEN("we get the right representation if it's not a simple fraction") { REQUIRE("1/2" == f2_string); }
        }
    }
}