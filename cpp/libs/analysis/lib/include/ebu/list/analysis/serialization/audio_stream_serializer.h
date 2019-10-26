#pragma once

#include "ebu/list/analysis/handlers/audio_stream_handler.h"
#include "ebu/list/analysis/serialization/audio_serialization.h"
#include "ebu/list/core/io/file_sink.h"
#include "ebu/list/core/platform/executor.h"

namespace ebu_list::analysis
{
    class audio_stream_serializer : public audio_stream_handler
    {
      public:
        audio_stream_serializer(rtp::packet first_packet, serializable_stream_info info, audio_stream_details details,
                                completion_handler ch, path base_dir);

      private:
        void on_sample_data(cbyte_span data) override;
        void on_stream_complete() override;
        path base_dir_;
        std::unique_ptr<file_sink> raw_data_;
    };
} // namespace ebu_list::analysis
