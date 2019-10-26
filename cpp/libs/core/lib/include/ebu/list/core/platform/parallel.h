#pragma once

#include "ebu/list/core/types.h"
#include <future>

namespace ebu_list
{
    // Launches a separate task.
    // Where T implements:
    // "bool next()", which processes the next item
    // "void done()", which is called when all items are processed
    template <class T> class launcher
    {
      public:
        explicit launcher(std::unique_ptr<T>&& target)
            : target_(std::move(target)), runner_(std::async(std::launch::async, [&]() { this->loop(); }))
        {
        }

        launcher(launcher<T>&&) = default;

        ~launcher()
        {
            stop();
            wait();
        }

        void stop() { done_ = true; }

        void wait() { runner_.wait(); }

        const T& target() const noexcept { return *target_; }

      private:
        std::unique_ptr<T> target_;
        std::future<void> runner_;
        bool done_ = false; // TODO: atomic?

        void loop()
        {
            while (!done_ && target_->next())
            {
            }

            target_->done();
        }
    };

    template <class T> // Where T implements "bool next()"
    auto launch(std::unique_ptr<T>&& t)
    {
        return launcher<T>(std::move(t));
    }

    template <class T, class... Args> // Where T implements "bool next()"
    auto make_and_launch(Args&&... args)
    {
        return launcher<T>(std::make_unique<T>(std::forward<Args&&>(args)...));
    }
} // namespace ebu_list
