#pragma once

#include "ebu/list/serialization/anc_serialization.h"
#include "ebu/list/handlers/anc_stream_handler.h"
#include "ebu/list/core/platform/executor.h"

namespace ebu_list
{

    class anc_stream_serializer : public anc_stream_handler
    {
    public:
        anc_stream_serializer(rtp::packet first_packet,
                serializable_stream_info info,
                anc_stream_details details,
                completion_handler ch,
                path base_dir);

    private:
        void on_sample() override;
        void on_stream_complete() override;

        const path base_dir_;
    };
}
