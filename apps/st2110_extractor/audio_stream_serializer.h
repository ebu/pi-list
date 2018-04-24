#pragma once

#include "ebu/list/serialization/audio_serialization.h"
#include "ebu/list/handlers/audio_stream_handler.h"
#include "ebu/list/executor.h"

namespace ebu_list
{

    class audio_stream_serializer : public audio_stream_handler
    {
    public:
        audio_stream_serializer(rtp::packet first_packet, serializable_stream_info info, audio_stream_details details,
            completion_handler ch, path base_dir);

    private:
        void on_sample(sample_uptr sample) override;
        void on_stream_complete() override;

        std::vector<sample_uptr> samples_;
        const path base_dir_;
    };
}
