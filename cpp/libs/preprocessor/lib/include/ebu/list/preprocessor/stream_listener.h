#pragma once

#include "ebu/list/analysis/handlers/dscp_analyzer.h"
#include "ebu/list/analysis/serialization/common.h"
#include "ebu/list/analysis/serialization/serializable_stream_info.h"
#include "ebu/list/rtp/listener.h"
#include "ebu/list/rtp/sequence_number_analyzer.h"
#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/st2110/packets_per_frame_calculator.h"
#include "ebu/list/st2110/rate_calculator.h"

namespace ebu_list::analysis
{
    class stream_listener : public rtp::listener
    {
      public:
        stream_listener(rtp::packet first_packet, std::string_view pcap_id);

        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        nlohmann::json get_info() const;

      private:
        analysis::serializable_stream_info stream_id_;
        st2110::format_detector detector_;
        int64_t num_packets_;
        rtp::sequence_number_analyzer<uint16_t> seqnum_analyzer_;
        dscp_analyzer dscp_;
        nlohmann::json info_;
    };
} // namespace ebu_list::analysis
