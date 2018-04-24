#include "pch.h"
#include "ptp_offset_calculator.h"

using namespace ebu_list;

//------------------------------------------------------------------------------

ptp_offset_calculator::ptp_offset_calculator() = default;

clock::duration ptp_offset_calculator::get_average_offset() const
{
    if (offsets_.empty()) return {};

    if (!average_offset_)
    {
        const auto total = std::accumulate(offsets_.begin(), offsets_.end(), clock::duration{}, [](const auto& acc, const auto& v) { return acc + v.offset_from_master; });
        const auto ns = total.count();
        const auto avg = ns / int64_t(offsets_.size());
        average_offset_ = clock::duration{ avg };
    }

    return average_offset_.value();
}

void ptp_offset_calculator::on_data(const ptp::state_machine::on_sync_data& data)
{
    offsets_.push_back(data);
}

void ptp_offset_calculator::on_complete()
{
}

void ptp_offset_calculator::on_error(std::exception_ptr)
{
}
