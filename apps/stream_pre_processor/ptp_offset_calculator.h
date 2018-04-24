#pragma once

#include "../../cpp/libs/ptp/lib/include/ebu/list/ptp/state_machine.h"

namespace ebu_list
{
    class ptp_offset_calculator : public ptp::state_machine::listener
    {
    public:
        ptp_offset_calculator();

        clock::duration get_average_offset() const;

    private:
        virtual void on_data(const ptp::state_machine::on_sync_data& data) override;
        void on_complete() override;
        void on_error(std::exception_ptr) override;

        std::vector<ptp::state_machine::on_sync_data> offsets_;
        mutable std::optional<clock::duration> average_offset_;
    };
}
