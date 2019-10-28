#pragma once

#include <functional>
#include <future>

namespace ebu_list
{
    class executor
    {
      public:
        executor();
        ~executor();

        using F = std::function<void()>;

        void execute(F&& f);
        void wait();

      private:
        struct impl;
        std::unique_ptr<impl> impl_;
    };

    using executor_ptr = std::shared_ptr<executor>;
} // namespace ebu_list
