#include "ebu/list/ptp/message.h"

using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------
ts80 ptp::to_ts80(const byte80& raw)
{
    int64_t i = 
        static_cast<int64_t>(raw[0]) << 40
        | static_cast<int64_t>(raw[1]) << 32
        | static_cast<int64_t>(raw[2]) << 24
        | static_cast<int64_t>(raw[3]) << 16
        | static_cast<int64_t>(raw[4]) << 8
        | static_cast<int64_t>(raw[5]);

    int64_t f = 
        static_cast<int64_t>(raw[6]) << 24
        | static_cast<int64_t>(raw[7]) << 16
        | static_cast<int64_t>(raw[8]) << 8
        | static_cast<int64_t>(raw[9]);

    return { i, f };
}

clock::time_point ptp::to_time_point(const ts80& t)
{
    // TODO: this will overflow many years from now
    const auto ns = t.i() * 1'000'000'000 + t.f();
    const auto tp = clock::time_point(std::chrono::duration_cast<clock::duration>(std::chrono::nanoseconds(ns)));
    return tp;
}
