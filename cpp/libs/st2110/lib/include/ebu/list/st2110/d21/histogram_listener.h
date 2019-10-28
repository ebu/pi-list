#pragma once

#include <map>
#include <memory>

namespace ebu_list::st2110::d21
{
    using histogram_t = std::map<int, int>;

    class histogram_listener
    {
      public:
        virtual ~histogram_listener() = default;

        virtual void on_data(const histogram_t&)    = 0;
        virtual void on_complete()                  = 0;
        virtual void on_error(std::exception_ptr e) = 0;
    };

    using histogram_listener_uptr = std::unique_ptr<histogram_listener>;

    class null_histogram_listener : public histogram_listener
    {
      public:
        virtual void on_data(const histogram_t&) {}
        virtual void on_complete() {}
        virtual void on_error(std::exception_ptr) {}
    };
} // namespace ebu_list::st2110::d21
