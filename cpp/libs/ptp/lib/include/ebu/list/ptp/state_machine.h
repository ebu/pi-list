#pragma once

#include "ebu/list/ptp/decoder.h"
#include "ebu/list/ptp/message_listener.h"
#include <memory>

namespace ebu_list::ptp
{
    class state_machine : public message_listener
    {
      public:
        struct on_sync_data
        {
            clock::time_point sync_message_timestamp;
            clock::duration offset_from_master;
        };

        class listener
        {
          public:
            using data_type = on_sync_data const&;

            virtual ~listener() = default;

            virtual void on_data(const on_sync_data& data) = 0;
            virtual void on_complete()                     = 0;
            virtual void on_error(std::exception_ptr e)    = 0;
        };

        using listener_ptr = std::shared_ptr<listener>;

        state_machine();
        explicit state_machine(listener_ptr l);
        ~state_machine();

        void on_data(ptp::some_message&& message) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;

      private:
        struct impl;
        const std::unique_ptr<impl> impl_;
    };

    using state_machine_listener_ptr  = state_machine::listener_ptr;
    using state_machine_listener_uptr = std::unique_ptr<state_machine::listener>;

    class null_state_machine_listener : public state_machine::listener
    {
      private:
        void on_data(const state_machine::on_sync_data&) override {}
        void on_complete() override {}
        void on_error(std::exception_ptr) override {}
    };
}