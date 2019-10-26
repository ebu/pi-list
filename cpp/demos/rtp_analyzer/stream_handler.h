#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/d20/packet.h"
#include "ebu/list/st2110/rate_calculator.h"
#include <map>
#include <optional>

namespace ebu_list
{
    template <typename ValueType> class histogram_data
    {
      public:
        void add(ValueType v)
        {
            auto it = values_.find(v);

            if (it != values_.end())
            {
                ++it->second;
            }
            else
            {
                values_.insert({v, 1});
            }
        }

        struct entry
        {
            ValueType value;
            int count;
            float relative;
        };

        using entries = std::vector<entry>;

        entries results() const
        {
            if (!results_.has_value())
            {
                results_ = calculate_results();
            }

            return results_.value();
        }

      private:
        std::map<ValueType, int> values_;
        mutable std::optional<entries> results_;

        entries calculate_results() const
        {
            const auto total = std::accumulate(values_.begin(), values_.end(), ValueType(),
                                               [](auto acc, auto& v) { return acc + v.second; });

            auto r = entries();
            r.reserve(values_.size());

            for (const auto& item : values_)
            {
                const auto& [value, count] = item;
                r.push_back({value, count, static_cast<float>(count) / total});
            }

            return r;
        }
    };

    struct stream_info
    {
        ipv4::endpoint source;
        ipv4::endpoint destination;
        uint32_t ssrc;
        uint32_t first_frame_ts = 0;
        uint32_t last_frame_ts  = 0;
        double rate             = 0.0;
        uint8_t payload_type    = 0;
        histogram_data<size_t>::entries packet_sizes;
        histogram_data<int>::entries ts_deltas;
        int packet_count = 0;
    };

    class stream_handler : public rtp::listener
    {
      public:
        explicit stream_handler(rtp::packet first_packet);

        const stream_info& info() const;

      private:
#pragma region udp::listener events
        void on_data(const rtp::packet& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

        st2110::rate_calculator rate_;
        mutable stream_info info_;
        histogram_data<size_t> packet_sizes_;
        histogram_data<int> timestamp_deltas_;
        std::optional<uint32_t> last_ts_;
    };

    using stream_handler_uptr = std::unique_ptr<stream_handler>;
}
