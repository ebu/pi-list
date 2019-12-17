#pragma once

#include "ebu/list/core/io/logger.h"
#include <future>
#include <mutex>
#include <optional>
#include <queue>

namespace ebu_list
{
    template <class T, typename Sender> class active_queue
    {
      public:
        active_queue(Sender sender)
            : sender_(sender), runner_(std::async(std::launch::async, [this]() { this->loop(); }))
        {
        }

        virtual ~active_queue()
        {
            this->shutdown();
            this->wait();
        }

        void shutdown()
        {
            std::unique_lock<std::mutex> mlock(mutex_);
            done_ = true;
            cv_.notify_all();
        }

        void wait() { runner_.wait(); }

        std::optional<T> pop()
        {
            std::unique_lock<std::mutex> mlock(mutex_);

            cv_.wait(mlock, [this]() { return this->is_not_empty_or_is_done_i(); });

            if(queue_.empty()) return std::nullopt;

            auto item = queue_.front();
            queue_.pop();
            return item;
        }

        void push(const T& item)
        {
            std::unique_lock<std::mutex> mlock(mutex_);
            queue_.push(item);
            cv_.notify_all();
        }

        void push(T&& item)
        {
            std::unique_lock<std::mutex> mlock(mutex_);
            queue_.push(std::move(item));
            cv_.notify_all();
        }

        bool empty()
        {
            std::unique_lock<std::mutex> mlock(mutex_);
            return queue_.empty();
        }

        // todo: implement emplace functions

      private:
        bool is_not_empty_or_is_done_i() const { return !queue_.empty() || done_; }

        void loop()
        {
            for(;;)
            {
                auto m = this->pop();
                if(!m) return;

                try
                {
                    sender_(std::move(*m));
                }
                catch(std::exception& ex)
                {
                    logger()->error("event sender exception: {}", ex.what());
                }
            }
        }

        Sender sender_;
        std::queue<T> queue_;
        std::mutex mutex_;
        std::condition_variable cv_;
        std::future<void> runner_;
        std::atomic_bool done_ = false;
    };
} // namespace ebu_list
