#pragma once

#include "ebu/list/analysis/handlers/ttml_stream_handler.h"

namespace ebu_list::analysis::ttml
{
    class stream_serializer : public analysis::ttml::stream_handler::listener
    {
      public:
        stream_serializer(const path& storage_folder, const std::string& stream_id);

        void on_data(uint32_t rtp_timestamp, std::string ttml_doc) override;
        void on_complete() override;
        void on_error(std::exception_ptr e) override;

      private:
        const path storage_folder_;
        const std::string stream_id_;
        int counter_ = 0;
    };
} // namespace ebu_list::analysis::ttml
