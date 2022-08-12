#pragma once

#include "ebu/list/analysis/handlers/jpeg_xs_stream_handler.h"
#include "ebu/list/analysis/serialization/compliance.h"
#include "ebu/list/net/mac_address_analyzer.h"

namespace ebu_list::analysis
{
    class jxsv_stream_serializer : public jpeg_xs_stream_handler
    {
      public:
        using completion_callback = std::function<void(const jxsv_stream_serializer& vsh)>;

        jxsv_stream_serializer(rtp::packet first_packet, serializable_stream_info info, video_stream_details details,
                               completion_callback on_complete_callback);

        [[nodiscard]] st2110::d21::video_analysis_info get_video_analysis_info() const;
        [[nodiscard]] mac_address_analyzer::mac_addresses_info get_mac_adresses_analyses() const;

      private:
        void on_frame_started(const frame_jpeg_xs& f) override;
        void on_packet(const packet_jpeg_xs_info& p) override;
        void on_frame_complete(frame_jpeg_xs_uptr&& frame) override;

        mac_address_analyzer mac_analyzer_;
        completion_callback on_complete_callback_;
        st2110::d21::compliance_analyzer compliance_;
    };
} // namespace ebu_list::analysis
