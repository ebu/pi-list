#pragma once

#include "ebu/list/handlers/video_stream_handler.h"
#include "ebu/list/executor.h"
#include "ebu/list/st2110/d21/c_analyzer.h"

namespace ebu_list
{
    class c_inst_histogram_writer : public st2110::d21::cinst_histogram_listener
    {
    public:
        explicit c_inst_histogram_writer(path info_path);

    private:
        const path info_path_;
        st2110::d21::cinst_histogram_t histogram_;

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
        video_stream_serializer(rtp::packet first_packet,
            serializable_stream_info info,
            video_stream_details details,
            completion_handler ch,
            path base_dir,
            executor_ptr main_executor);

    private:
        void on_frame_started(const frame& f) override;

        void on_frame_complete(frame_uptr&& f) override;

        void on_packet(const packet_info& p) override;

        const path base_dir_;
        executor_ptr main_executor_;
        const media::video::video_dimensions frame_size_;
        packets current_frame_packets_;
    };
}
