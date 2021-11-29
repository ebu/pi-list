#pragma once

#include "ebu/list/analysis/utils/histogram_listener.h"
#include "ebu/list/core/types.h"
#include "ebu/list/st2110/d22/packet_interval_time_analyzer.h"
#include "nlohmann/json.hpp"

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

    class pit_writer : public st2110::d22::packet_interval_time_analyzer::listener
    {
      public:
        explicit pit_writer(path info_path, std::string_view filename);

      private:
        const path info_path_;
        const std::string filename_;

        virtual void on_data(const st2110::d22::packet_interval_time_analyzer::packet_interval_time_info&) override;
        virtual void on_complete() override;
        virtual void on_error(std::exception_ptr e) override;
    };

} // namespace ebu_list::analysis
