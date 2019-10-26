#pragma once

#include "ebu/list/core/platform/time.h"
#include "influxdb_line.h"
#include "influxdb_simple_api.h"
#include <optional>
#include <string>

namespace ebu_list::influx
{
    namespace details
    {
        // used in order to send the real packet time to influxDB
        struct packet_time_wrapper
        {
            clock::rep time;

            [[nodiscard]] inline size_t now() const { return time; }
        };
    } // namespace details

    class caching_influx_writer
    {
      public:
        explicit caching_influx_writer(std::string_view url);

        void write(influxdb::api::line&& line);

        void on_complete();

      private:
        influxdb::api::simple_db api_;
        std::string lines_;
        int count_ = 0;

        void check_cache();

        void send_cache();
    };

    class base_influx_logger
    {
      public:
        base_influx_logger(std::string_view url, std::string_view pcap_id, std::string_view stream_id);

        template <typename T> void send_data(const std::string& key, T value, clock::time_point when)
        {
            const auto time = std::chrono::duration_cast<clock::duration>(when.time_since_epoch()).count();
            writer_.write(influxdb::api::line(pcap_id_, influxdb::api::key_value_pairs("stream", stream_id_),
                                              influxdb::api::key_value_pairs(key, value),
                                              details::packet_time_wrapper{time}));
        }

        template <typename T> void send_data(const std::string& key, std::optional<T> value, clock::time_point when)
        {
            if (!value.has_value()) return;
            send_data(key, value.value(), when);
        }

        void on_complete();

      private:
        caching_influx_writer writer_;
        std::string pcap_id_;
        std::string stream_id_;
    };
} // namespace ebu_list::influx
