#pragma once

#include "ebu/list/analysis/handlers/dscp_analyzer.h"
#include "ebu/list/analysis/serialization/anc_serialization.h"
#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/analysis/utils/rtp_utils.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/mac_address_analyzer.h"
#include "ebu/list/rtp/inter_packet_spacing_analyzer.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/types.h"
#include "ebu/list/st2110/d40/header.h"
#include "ebu/list/st2110/packets_per_frame_calculator.h"

#pragma GCC diagnostic ignored "-Wpedantic"
#include <libklvanc/vanc.h>
#pragma GCC diagnostic pop

namespace ebu_list::analysis
{
    class anc_stream_handler : public rtp::listener
    {
      public:
        enum class payload_analysis_t
        {
            yes,
            no
        };

        using completion_handler = std::function<void(const anc_stream_handler& ash)>;

        struct frame_info
        {
            clock::time_point timestamp;
            int packets_per_frame;
        };

        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(const frame_info& frame_info) = 0;
            virtual void on_complete()                         = 0;
            virtual void on_error(std::exception_ptr e)        = 0;
        };

        anc_stream_handler(
            const rtp::packet& first_packet, const serializable_stream_info& info, const anc_stream_details& details,
            payload_analysis_t payload_analysis, completion_handler ch = [](const anc_stream_handler&) {});
        ~anc_stream_handler() override;

        [[nodiscard]] mac_address_analyzer::mac_addresses_info get_mac_adresses_analyses() const;
        [[nodiscard]] const anc_stream_details& info() const;
        [[nodiscard]] const serializable_stream_info& network_info() const;

      private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion rtp::listener events

#pragma region event handlers
        virtual void on_sample()          = 0;
        virtual void on_stream_complete() = 0;
#pragma endregion event handlers

        void parse_packet(const rtp::packet& packet);

        serializable_stream_info info_;
        anc_stream_details anc_description_;
        const payload_analysis_t payload_analysis_;
        completion_handler completion_handler_;
        mac_address_analyzer mac_analyzer_;

        struct klvanc_context_s* klvanc_ctx = nullptr;
        bool last_frame_was_marked_         = false;
        uint8_t field_                      = static_cast<uint8_t>(ebu_list::st2110::d40::field_kind::undefined);
        uint8_t last_field_                 = static_cast<uint8_t>(ebu_list::st2110::d40::field_kind::undefined);
        rtp::inter_packet_spacing_analyzer inter_packet_spacing_;
    };

    using anc_stream_handler_uptr = std::unique_ptr<anc_stream_handler>;
} // namespace ebu_list::analysis
