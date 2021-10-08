#include "ebu/list/core/platform/time.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/platform/config.h"
#include "fmt/chrono.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

std::string ebu_list::to_date_time_string(const clock::time_point& tp)
{
    const auto ts = tp.time_since_epoch().count();

    const auto ts_sec  = static_cast<time_t>(ts / std::nano::den);
    const auto ts_nsec = ts % std::nano::den;

    return fmt::format("{:%Y-%m-%d %H:%M:%S}.{:09d}", fmt::gmtime(ts_sec), ts_nsec);
}
