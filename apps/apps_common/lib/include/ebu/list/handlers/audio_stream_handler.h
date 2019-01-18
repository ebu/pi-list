#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/serialization/serializable_stream_info.h"
#include "ebu/list/serialization/audio_serialization.h"

namespace ebu_list
{
    struct sample_info
    {
        uint32_t timestamp = 0;
    };

    struct sample : sample_info
    {
        std::vector<sbuffer_ptr> buffer; // one position for each channel
    };
    using sample_uptr = std::unique_ptr<sample>;

    /*
     * Audio packet jitter measurement
     * https://tech.ebu.ch/docs/tech/tech3337.pdf
     *
     * Relative Transit Time:
     * D(i,0) = ((R(i) - R(0)) - (S(i) - S(0)))
     * which is equivalent to:
     * D(i,0) = ((R(i) - S(i)) - (R(0)) - S(0)))
     *
     * with:
     * R(0): receive time of the reference packet, the first of measurement window
     * S(0): rtp time of the reference packet
     * R(i): receive time of packet i
     * S(i): rtp time of the packet i
     *
     */

    class audio_jitter_analyser : public rtp::listener
    {
    public:
        struct tsdf_sample
        {
            clock::time_point timestamp;
            int64_t time_stamped_delay_factor;
        };

        class listener
        {
        public:
            virtual ~listener() = default;

            virtual void on_data(const tsdf_sample&) = 0;
            virtual void on_complete() = 0;
            virtual void on_error(std::exception_ptr e) = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        audio_jitter_analyser(rtp::packet first_packet, listener_uptr listener, int sampling);
        ~audio_jitter_analyser();

        void on_data(const rtp::packet&) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

    private:
        struct impl;
        const std::unique_ptr<impl> impl_;

        int64_t get_transit_time(const rtp::packet& packet);

        int sampling_;
        int64_t first_delta_usec_;
        int64_t first_packet_ts_usec_;
        int64_t relative_transit_time_max_;
        int64_t relative_transit_time_min_;
    };

    class audio_stream_handler : public rtp::listener
    {
    public:
        using completion_handler = std::function<void(const audio_stream_handler& ash)>;

        audio_stream_handler(rtp::packet first_packet,
            serializable_stream_info info,
            audio_stream_details details,
            completion_handler ch = [](const audio_stream_handler&) {});

        const audio_stream_details& info() const;
        const serializable_stream_info& network_info() const;

    private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_sample(sample_uptr sample) = 0;
        virtual void on_stream_complete() = 0;
#pragma endregion event handlers

        void new_sample();
        void parse_packet(const rtp::packet& packet);

        sample_uptr current_sample_;
        malloc_sbuffer_factory block_factory_;

        serializable_stream_info info_;
        audio_stream_details audio_description_;

        completion_handler completion_handler_;
    };

    using audio_stream_handler_uptr = std::unique_ptr<audio_stream_handler>;
}
