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

        struct info
        {
            std::optional<v2::clock_id_t> grandmaster_id;
            std::optional<v2::clock_id_t> master_id;
            std::optional<bool> is_two_step;

            // The offset is positive if the packet timestamp of the SYNC message is
            // greater than the announced value, negative otherwise.
            clock::duration average_offset;
        };

        // Return std::nullopt if no PTP packet was received, a value otherwise
        std::optional<info> get_info() const;

        void on_data(ptp::some_message&& message) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };
} // namespace ebu_list::ptp