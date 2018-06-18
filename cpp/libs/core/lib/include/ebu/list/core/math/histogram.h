#pragma once

#include <map>

namespace ebu_list
{
    template<typename T>
    class histogram
    {
    public:
        using value_type = std::map<int, T>;

        void clear()
        {
            values_.clear();
        }

        void add_value(T value)
        {
            auto it = values_.find(value);
            if (it == values_.end())
            {
                values_.insert({ value, 1 });
            }
            else
            {
                it->second = it->second + 1;
            }
        }

        const value_type& values() const noexcept
        {
            return values_;
        }

    private:
        value_type values_;
    };

    // Adjusts values so that, if the lowest key is negative, it is raised to zero 
    // and all other values are adjusted accordingly
    template<typename T>
    std::map<int, T> normalize_negative_to_zero(const std::map<int, T>& source)
    {
        if (source.empty()) return source;

        const auto lowest = source.begin()->first;

        if (lowest >= 0) return source;

        histogram<int>::value_type target;
        const auto offset = -lowest;
        for (const auto& v : source)
        {
            target.insert({ v.first + offset, v.second });
        }

        return target;
    }

    // Returns the lowest key in an histogram, 0 if empty
    template<typename T>
    T get_histogram_min(const std::map<int, T>& h)
    {
        if (h.empty()) return 0;
        const auto lowest = h.cbegin();
        return lowest->first;
    }

    // Returns the highest key in an histogram, 0 if empty
    template<typename T>
    T get_histogram_peak(const std::map<int, T>& h)
    {
        if (h.empty()) return 0;
        const auto highest = h.crbegin();
        return highest->first;
    }

    // Returns the highest key in an histogram, 0 if empty
    template<typename T>
    std::map<int, float> transform_histogram_samples_to_percentages(const std::map<int, T>& h)
    {
        if (h.empty()) return {};

        const auto total = std::accumulate(h.cbegin(), h.cend(), 0, [](int acc, const auto& v) {
            return acc + v.second;
        });

        auto result = std::map<int, float>{};
        std::transform(h.cbegin(), h.cend(), std::inserter(result, result.end()),
            [total](const auto& v) {
            return std::pair(v.first, static_cast<float>(v.second) * 100.0f / total);
        });

        return result;
    }
}
