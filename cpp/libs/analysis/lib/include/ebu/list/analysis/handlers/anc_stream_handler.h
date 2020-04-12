#pragma once

#include "ebu/list/analysis/handlers/dscp_analyzer.h"
#include "ebu/list/analysis/serialization/anc_serialization.h"
#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/analysis/utils/rtp_utils.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/sequence_number_analyzer.h"
#include "ebu/list/st2110/packets_per_frame_calculator.h"
#include "ebu/list/st2110/d40/header.h"

#pragma GCC diagnostic ignored "-Wpedantic"
#include <libklvanc/vanc.h>
#pragma GCC diagnostic pop

namespace ebu_list::analysis
{
    class anc_stream_handler : public rtp::listener
    {
      public:
        using completion_handler = std::function<void(const anc_stream_handler& ash)>;

        struct frame_info
        {
            clock::time_point timestamp;
            int packets_per_frame;
            delta_info first_rtp_to_packet_deltas;
        };

        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(const frame_info& frame_info) = 0;
            virtual void on_complete()                         = 0;
            virtual void on_error(std::exception_ptr e)        = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;

        anc_stream_handler(
            rtp::packet first_packet, listener_uptr l_rtp, histogram_listener_uptr l_h, serializable_stream_info info,
            anc_stream_details details, completion_handler ch = [](const anc_stream_handler&) {});
        ~anc_stream_handler() override;

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

        struct impl;
        const std::unique_ptr<impl> impl_;
        serializable_stream_info info_;
        anc_stream_details anc_description_;
        completion_handler completion_handler_;

        rtp::sequence_number_analyzer<uint32_t> rtp_seqnum_analyzer_;
        struct klvanc_context_s* klvanc_ctx;
        bool last_frame_was_marked_ = false;
        uint8_t field_ = static_cast<uint8_t>(ebu_list::st2110::d40::field_kind::undefined);
        uint8_t last_field_ = static_cast<uint8_t>(ebu_list::st2110::d40::field_kind::undefined);
        st2110::packets_per_frame_calculator packets_per_frame_;
        delta_info first_rtp_to_packet_deltas_;
        dscp_analyzer dscp_;
    };

    using anc_stream_handler_uptr = std::unique_ptr<anc_stream_handler>;
} // namespace ebu_list::analysis

typedef int (*callback_klvanc_smpte_12_2_t)(void*, struct klvanc_context_s*, struct klvanc_packet_smpte_12_2_s*);
