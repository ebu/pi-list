#pragma once

#include <boost/asio/high_resolution_timer.hpp>

namespace ebu_list::preprocessor
{
    template <typename Callable, typename DurationType> class interval_timer
    {
      public:
        interval_timer(boost::asio::io_context& io_context, DurationType period, Callable callable)
            : timer_(io_context, period)
        {
            timer_.async_wait([this, period, callable](const boost::system::error_code& /*e*/) {
                callback(&timer_, period, callable);
            });
        }

        void fire_async() { timer_.expires_from_now(std::chrono::milliseconds(1)); }

      private:
        boost::asio::high_resolution_timer timer_;

        static void callback(boost::asio::high_resolution_timer* timer, DurationType period, Callable callable)
        {
            (callable)();
            timer->expires_from_now(period);
            timer->async_wait([timer, period, callable](const boost::system::error_code& /*e*/) {
                callback(timer, period, callable);
            });
        }
    };
} // namespace ebu_list::preprocessor
