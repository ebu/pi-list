#pragma once

#include <algorithm>
#include <memory>
#include <vector>

namespace ebu_list::analysis
{
    template <class ListenerT, class MessageT> struct multi_listener_t : public ListenerT
    {
        using listener_uptr = std::unique_ptr<ListenerT>;

      public:
        void add(listener_uptr&& sublistener) { listeners_.push_back(std::move(sublistener)); }

        void on_data(const MessageT& p) override
        {
            std::for_each(listeners_.begin(), listeners_.end(), [p](auto& l) { l->on_data(p); });
        }

        void on_complete() override
        {
            std::for_each(listeners_.begin(), listeners_.end(), [](auto& l) { l->on_complete(); });
        }

        void on_error(std::exception_ptr e) override
        {
            std::for_each(listeners_.begin(), listeners_.end(), [e](auto& l) { l->on_error(e); });
        }

      private:
        using listeners = std::vector<listener_uptr>;
        listeners listeners_;
    };
} // namespace ebu_list::analysis