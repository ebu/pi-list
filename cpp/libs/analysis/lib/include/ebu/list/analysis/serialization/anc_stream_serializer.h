#pragma once

#include "ebu/list/analysis/handlers/anc_stream_handler.h"
#include "ebu/list/analysis/serialization/anc_serialization.h"
#include "ebu/list/core/platform/executor.h"

namespace ebu_list::analysis
{
    class anc_stream_serializer : public anc_stream_handler
    {
      public:
        anc_stream_serializer(const rtp::packet& first_packet, const serializable_stream_info& info,
                              const anc_stream_details& details, payload_analysis_t payload_analysis,
                              completion_handler ch, path base_dir);

      private:
        void on_sample() override;
        void on_stream_complete() override;

        const path base_dir_;
    };
} // namespace ebu_list::analysis
