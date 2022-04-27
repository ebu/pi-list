#pragma once

#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/analysis/serialization/ttml_serialization.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/analysis/utils/rtp_utils.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/packets_per_frame_calculator.h"
#include "ebu/list/net/mac_address_analyzer.h"

namespace ebu_list::analysis::ttml
{
    class stream_handler : public ebu_list::rtp::listener
    {
      public:
        using completion_handler = std::function<void(const stream_handler& ash)>;

        class listener
        {
          public:
            virtual ~listener() = default;

            virtual void on_data(uint32_t rtp_timestamp, std::string ttml_doc) = 0;
            virtual void on_complete()                                         = 0;
            virtual void on_error(std::exception_ptr e)                        = 0;
        };

        using listener_uptr = std::unique_ptr<listener>;



        stream_handler(
            ebu_list::rtp::packet first_packet, listener_uptr l_rtp, serializable_stream_info info,
            ttml::stream_details details, completion_handler ch = [](const stream_handler&) {});

        ~stream_handler() override;

        [[nodiscard]] const stream_details& info() const;
        [[nodiscard]] const serializable_stream_info& network_info() const;
        [[nodiscard]] mac_address_analyzer::mac_addresses_info get_mac_adresses_analyses() const;


      private:
#pragma region rtp::listener events
        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;
#pragma endregion rtp::listener events

        mac_address_analyzer mac_analyzer_;
        struct impl;
        const std::unique_ptr<impl> impl_;
    };

    using stream_handler_uptr = std::unique_ptr<stream_handler>;
} // namespace ebu_list::analysis::ttml
