#pragma once

#include "ebu/list/core/types.h"

namespace ebu_list::ptp
{
    // R is the fractional resolution, e.g. std::nano
    template<class R>
    class decimal
    {
    public:
        constexpr decimal() = default;
        
        constexpr decimal(int64_t i, int64_t f)
            : integral_(i),
            fractional_(f)
        {
        }

        constexpr int64_t i() const { return integral_; }
        constexpr int64_t f() const { return fractional_; }

    private:
        int64_t integral_ = 0;
        int64_t fractional_ = 0;
    };

    template<class R>
    bool operator==(const decimal<R>& lhs, const decimal<R>& rhs)
    {
        return std::make_tuple(lhs.i(), lhs.f()) == std::make_tuple(rhs.i(), rhs.f());
    }

    template<class R>
    std::ostream& operator<<(std::ostream& os, const decimal<R>& d)
    {
        // TODO: align the fractional part correctly based on R, and 
        // then represent as "I.F"
        os << '(' << d.i() << '|' << d.f() << ')';
        return os;
    }
}
