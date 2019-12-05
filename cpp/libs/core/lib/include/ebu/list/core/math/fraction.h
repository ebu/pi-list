#pragma once

#include "ebu/list/core/idioms.h"
#include "fmt/format.h"
#include <numeric>
#include <string>

namespace ebu_list
{
    /**
     * Fraction abstraction
     *
     * It creates a numerator / denominator abstraction.
     * When a fraction is created, it gets normalized, so a
     * fraction(4,2) has numerator 2 and denominator 1
     *
     */
    template <typename T> class fraction_t
    {
        /// used for constructing a fraction from a double
        inline static const T ebu_list_fraction_precision{1000};

      public:
        constexpr fraction_t() = default;
        constexpr explicit fraction_t(double number) noexcept
            : fraction_t(static_cast<T>(number * ebu_list_fraction_precision), ebu_list_fraction_precision)
        {
        }

        template <typename I, typename J>
        constexpr fraction_t(I numerator, J denominator) : numerator_(numerator), denominator_(denominator)
        {
            LIST_ENFORCE(denominator != 0, std::domain_error, "Denominator can't be 0");
            normalize();
        }

        template <typename U>
        constexpr fraction_t(fraction_t<U> u) : numerator_(u.numerator()), denominator_(u.denominator())
        {
        }

        constexpr T numerator() const noexcept { return numerator_; }

        constexpr T denominator() const noexcept { return denominator_; }

        constexpr bool operator==(const fraction_t<T>& rhs) const noexcept
        {
            return numerator_ == rhs.numerator_ && denominator_ == rhs.denominator_;
        }

        constexpr bool operator!=(const fraction_t<T>& rhs) const noexcept { return !(rhs == *this); }

        inline operator double() const noexcept
        {
            return static_cast<double>(numerator_) / static_cast<double>(denominator_);
        }

      private:
        constexpr void normalize() noexcept
        {
            const auto gcd_val = std::gcd(numerator_, denominator_);
            LIST_ASSERT(gcd_val != 0);

            this->numerator_ /= gcd_val;
            this->denominator_ /= gcd_val;
        }

      private:
        T numerator_   = 0;
        T denominator_ = 1;
    };

    template <typename T, typename U> constexpr auto operator*(fraction_t<U> u, fraction_t<T> f)
    {
        return fraction_t<decltype(T() * U())>(u.numerator() * f.numerator(), u.denominator() * f.denominator());
    }

    template <typename T, typename U> constexpr auto operator+(fraction_t<U> lhs, fraction_t<T> rhs)
    {
        const auto lcm      = std::lcm(lhs.denominator(), rhs.denominator());
        const auto l_factor = lcm / lhs.denominator();
        const auto r_factor = lcm / rhs.denominator();

        const auto l_n = lhs.numerator() * l_factor;
        const auto r_n = rhs.numerator() * r_factor;
        return fraction_t<decltype(T() + U())>{l_n + r_n, lcm};
    }

    template <typename T, typename U> constexpr auto operator+(U u, fraction_t<T> rhs)
    {
        return fraction_t<decltype(T() + U())>(u, 1) + rhs;
    }

    template <typename T, typename U> constexpr auto operator+(fraction_t<T> rhs, U u)
    {
        return rhs + fraction_t<U>(u, 1);
    }

    template <typename T, typename U> constexpr auto operator-(fraction_t<U> lhs, fraction_t<T> rhs)
    {
        const auto lcm      = std::lcm(lhs.denominator(), rhs.denominator());
        const auto l_factor = lcm / lhs.denominator();
        const auto r_factor = lcm / rhs.denominator();

        const auto l_n = lhs.numerator() * l_factor;
        const auto r_n = rhs.numerator() * r_factor;
        return fraction_t<decltype(T() - U())>{l_n - r_n, lcm};
    }

    template <typename T, typename U> constexpr auto operator-(U u, fraction_t<T> rhs)
    {
        return fraction_t<U>(u, 1) - rhs;
    }

    template <typename T, typename U> constexpr auto operator-(fraction_t<T> rhs, U u)
    {
        return rhs - fraction_t<U>(u, 1);
    }

    template <typename T, typename U> constexpr auto operator*(U u, fraction_t<T> f)
    {
        return fraction_t<decltype(T() * U())>(u * f.numerator(), f.denominator());
    }

    template <typename T, typename U> constexpr auto operator*(fraction_t<T> f, U u)
    {
        return fraction_t<decltype(T() * U())>(u * f.numerator(), f.denominator());
    }

    template <typename T, typename U> constexpr auto operator/(fraction_t<U> u, fraction_t<T> f)
    {
        return fraction_t<decltype(T() / U())>(u.numerator() * f.denominator(), u.denominator() * f.numerator());
    }

    template <typename T, typename U> constexpr auto operator/(U u, fraction_t<T> f)
    {
        return fraction_t<decltype(T() / U())>(u * f.denominator(), f.numerator());
    }

    template <typename T, typename U> constexpr auto operator/(fraction_t<T> f, U u)
    {
        return fraction_t<decltype(T() / U())>(f.numerator(), f.denominator() * u);
    }

    template <typename T> inline T floor(const fraction_t<T>& f) { return f.numerator() / f.denominator(); }

    template <typename T> inline T ceil(const fraction_t<T>& f) { return static_cast<T>(std::ceil(to_double(f))); }

    template <typename T> constexpr double to_float(const fraction_t<T>& f) noexcept { return static_cast<float>(f); }

    template <typename T> constexpr double to_double(const fraction_t<T>& f) noexcept { return static_cast<double>(f); }

    /**
     * Converts a fraction to a string representation
     * If the fraction represents an integer number, it returns that number
     * Otherwise, returns a numerator/denominator string
     */
    template <typename T> inline std::string to_string(const fraction_t<T>& f)
    {
        if(f.denominator() == 1)
        {
            return std::to_string(f.numerator());
        }
        else
        {
            return fmt::format("{}/{}", f.numerator(), f.denominator());
        }
    }

    // TODO: make this generic
    template <typename T> T modulo_difference(T lhs, T rhs) noexcept
    {
        if(rhs < lhs)
        {
            return lhs - rhs;
        }
        else
        {
            const auto d = std::numeric_limits<T>::max() - rhs + 1;
            return static_cast<T>(lhs + d);
        }
    }

    using fraction   = fraction_t<int>;
    using fraction64 = fraction_t<int64_t>;
} // namespace ebu_list
