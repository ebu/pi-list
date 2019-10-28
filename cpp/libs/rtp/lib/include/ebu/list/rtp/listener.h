#pragma once

#include "ebu/list/rtp/decoder.h"

namespace ebu_list::rtp
{
    class listener
    {
      public:
        virtual ~listener() = default;

        virtual void on_data(const packet& p)     = 0;
        virtual void on_complete()                = 0;
        virtual void on_error(std::exception_ptr) = 0;
    };

    using listener_ptr  = std::shared_ptr<listener>;
    using listener_uptr = std::unique_ptr<listener>;

    struct null_listener : rtp::listener
    {
        void on_data(const rtp::packet&) override {}
        void on_complete() override {}
        void on_error(std::exception_ptr) override {}
    };
} // namespace ebu_list::rtp
