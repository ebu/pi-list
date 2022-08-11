#pragma once

#include "ebu/list/analysis/handlers/dscp_analyzer.h"
#include "ebu/list/analysis/serialization/audio_serialization.h"
#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/mac_address_analyzer.h"
#include "ebu/list/rtp/inter_packet_spacing_analyzer.h"
#include "ebu/list/rtp/listener.h"

namespace ebu_list::analysis
{
    class audio_stream_handler : public rtp::listener
    {
      public:
        using completion_handler = std::function<void(const audio_stream_handler& ash)>;

        audio_stream_handler(
            rtp::packet first_packet, serializable_stream_info info, audio_stream_details details,
            completion_handler ch = [](const audio_stream_handler&) {});

        [[nodiscard]] const audio_stream_details& info() const;
        [[nodiscard]] const serializable_stream_info& network_info() const;
        [[nodiscard]] mac_address_analyzer::mac_addresses_info get_mac_adresses_analyses() const;

      private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion udp::listener events

#pragma region event handlers
        virtual void on_sample_data(cbyte_span data) = 0;
        virtual void on_stream_complete()            = 0;
#pragma endregion event handlers

        void parse_packet(const rtp::packet& packet);

        serializable_stream_info info_;
        audio_stream_details audio_description_;
        completion_handler completion_handler_;
        rtp::inter_packet_spacing_analyzer inter_packet_spacing_;
        mac_address_analyzer mac_analyzer_;
    };

    using audio_stream_handler_uptr = std::unique_ptr<audio_stream_handler>;
} // namespace ebu_list::analysis
