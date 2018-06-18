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

        void execute(F f);
        void wait();

    private:
        using FT = std::future<void>;
        std::vector<FT> futures_;
    };

    using executor_ptr = std::shared_ptr<executor>;
}
