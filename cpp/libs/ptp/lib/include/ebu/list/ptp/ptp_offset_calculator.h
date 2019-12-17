#pragma once

#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/message_listener.h"
#include <memory>

namespace ebu_list::ptp
{
    class ptp_offset_calculator : public message_listener
    {
      public:
        ptp_offset_calculator();
        ~ptp_offset_calculator();

        // The offset is positive if the packet timestamp of the SYNC message is
        // greater than the announced value, negative otherwise.
        clock::duration get_average() const;

        void on_data(ptp::some_message&& message) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::ptp