#pragma once

#include "ebu/list/core/types.h"
#include "nlohmann/json.hpp"
#include "ebu/list/analysis/utils/histogram_listener.h"

namespace ebu_list::analysis
{
    void write_json_to(const path& dir, const std::string& filename, const nlohmann::json& content);

    class histogram_writer : public histogram_listener
    {
      public:
        explicit histogram_writer(path info_path, std::string_view filename);

      private:
        const path info_path_;
        const std::string filename_;

        // Inherited via cinst_histogram_listener
        virtual void on_data(const histogram_t&) override;
        virtual void on_complete() override;
        virtual void on_error(std::exception_ptr e) override;
    };

}
