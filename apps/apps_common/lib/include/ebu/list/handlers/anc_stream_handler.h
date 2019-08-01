#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/sequence_number_analyzer.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/serialization/serializable_stream_info.h"
#include "ebu/list/serialization/anc_serialization.h"

namespace ebu_list
{
    class anc_stream_handler : public rtp::listener
    {
    public:
        using completion_handler = std::function<void(const anc_stream_handler& ash)>;

        anc_stream_handler(rtp::packet first_packet,
            serializable_stream_info info,
            anc_stream_details details,
            completion_handler ch = [](const anc_stream_handler&) {});

        const anc_stream_details& info() const;
        const serializable_stream_info& network_info() const;

    private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;

        void on_complete() override;

        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_sample() = 0;
        virtual void on_stream_complete() = 0;
#pragma endregion event handlers

        void parse_packet(const rtp::packet& packet);

        serializable_stream_info info_;
        anc_stream_details anc_description_;
        rtp::sequence_number_analyzer<uint32_t> rtp_seqnum_analyzer_;

        completion_handler completion_handler_;
    };

    using anc_stream_handler_uptr = std::unique_ptr<anc_stream_handler>;
}
