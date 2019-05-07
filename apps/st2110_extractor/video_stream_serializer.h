#pragma once

#include "ebu/list/handlers/video_stream_handler.h"
#include "ebu/list/core/platform/executor.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/st2110/d21/compliance.h"
#include "ebu/list/serialization/compliance.h"

namespace ebu_list
{
    class histogram_writer : public st2110::d21::histogram_listener
    {
    public:
        explicit histogram_writer(path info_path, std::string_view filename);

    private:
        const path info_path_;
        const std::string filename_;

        // Inherited via cinst_histogram_listener
        virtual void on_data(const st2110::d21::cinst_histogram_t&) override;
        virtual void on_complete() override;
        virtual void on_error(std::exception_ptr e) override;
    };

    void write_frame_info(const path& base_dir, const std::string& stream_id, const frame_info& info);

    using packets = std::vector<packet_info>;

    void write_packets(const path& packets_path, const packets& packets_info);

    class video_stream_serializer : public video_stream_handler
    {
    public:
        using completion_callback = std::function<void(const video_stream_serializer& vsh)>;

        video_stream_serializer(rtp::packet first_packet,
            serializable_stream_info info,
            video_stream_details details,
            path base_dir,
            executor_ptr main_executor,
            completion_callback on_complete_callback);

        st2110::d21::video_analysis_info get_video_analysis_info() const;

    private:
        void on_frame_started(const frame& f) override;

        void on_frame_complete(frame_uptr&& f) override;

        void on_packet(const packet_info& p) override;

        void on_complete(const video_stream_handler& handler);

        const path base_dir_;
        executor_ptr main_executor_;
        const media::video::video_dimensions frame_size_;
        completion_callback on_complete_callback_;
        packets current_frame_packets_;
        st2110::d21::compliance_analyzer compliance_;
    };
}
