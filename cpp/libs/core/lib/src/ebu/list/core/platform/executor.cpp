#include "ebu/list/core/platform/executor.h"
#include "ebu/list/core/io/logger.h"
#include <optional>
using namespace ebu_list;

//------------------------------------------------------------------------------
namespace
{
    constexpr auto n_threads       = 4;
    constexpr auto high_water_mark = n_threads * 16;
} // namespace
//------------------------------------------------------------------------------
struct executor::impl
{
    impl()
    {
        threads_.reserve(n_threads);

        for (auto i = 0; i < n_threads; ++i)
        {
            threads_.emplace_back(std::thread([this]() { this->run(); }));
        }
    }

    void execute(F&& f)
    {
        std::unique_lock lock(mutex_);

        cv_.wait(lock, [this]() { return tasks_.size() < high_water_mark; });

        tasks_.push_back(std::move(f));
        cv_.notify_one();
    }

    void done()
    {
        done_ = true;
        cv_.notify_all();
    }

    void wait()
    {
        std::for_each(threads_.begin(), threads_.end(), [](std::thread& t) {
            if (t.joinable()) t.join();
        });
    }

    void run()
    {
        for (;;)
        {
            auto maybe_f = get_next();
            if (!maybe_f) return;
            execute_one(std::move(*maybe_f));
        }
    }

    void execute_one(F&& f)
    {
        try
        {
            f();
        }
        catch (std::exception& ex)
        {
            logger()->error("exception while executing asynchronous task: {}", ex.what());
        }
        catch (...)
        {
            logger()->error("unknown exception while executing asynchronous task");
        }
    }

    std::optional<F> get_next()
    {
        std::unique_lock lock(mutex_);
        cv_.wait(lock, [this]() { return !tasks_.empty() || done_; });

        if (tasks_.empty())
        {
            assert(done_);
            return std::nullopt;
        }

        auto f = std::move(tasks_.front());
        tasks_.erase(tasks_.begin());

        cv_.notify_one();

        return f;
    }

    std::mutex mutex_;
    std::condition_variable cv_;
    std::vector<F> tasks_;
    std::vector<std::thread> threads_;

    std::atomic<int> total_   = 0;
    std::atomic<int> pending_ = 0;
    std::atomic<bool> done_   = false;

    using FT = std::future<void>;
    std::vector<FT> futures_;
};
//------------------------------------------------------------------------------

executor::executor() : impl_(std::make_unique<impl>())
{
}

executor::~executor()
{
    wait();
}

void executor::execute(F&& f)
{
    impl_->execute(std::move(f));
}

void executor::wait()
{
    impl_->done();
    impl_->wait();
}
