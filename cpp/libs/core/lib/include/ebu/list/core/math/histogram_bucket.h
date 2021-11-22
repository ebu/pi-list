#pragma once

#include <map>

namespace ebu_list
{
    template <typename T> class histogram_bucket
    {
      public:
        using value_type = std::map<int, T>;

        void clear() { values_.clear(); }

        void add_value(T value, T bucket_width)
        {
            const int result = value / bucket_width;
            auto it = values_.find(result*bucket_width);
            if(it == values_.end())
            {
                values_.insert({result*bucket_width, 1});
            }
            else
            {
                it->second = it->second + 1;
            }
        }

        const value_type& values() const noexcept { return values_; }

      private:
        value_type values_;
    };
} // namespace ebu_list
