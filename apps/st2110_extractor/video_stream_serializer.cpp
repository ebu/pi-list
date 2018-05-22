#include "video_stream_serializer.h"
#include "png_writer.h"
#include "color_conversion.h"
#include "ebu/list/serialization/utils.h"
#include "ebu/list/constants.h"

using namespace ebu_list;
using json =  nlohmann::json;

namespace
{
    constexpr auto packets_file_name = "packets.json";
    constexpr auto cinst_file_name = "cinst.json";

    media::video::video_dimensions get_frame_size(const video_stream_details& info)
    {
        auto dimensions = info.video.dimensions;
        if (info.video.scan_type == media::video::scan_type::INTERLACED)
        {
            dimensions.height /= 2;
        }

        return dimensions;
    }
}

void ebu_list::write_frame_info(const path& base_dir, const std::string& stream_id, const frame_info& info)
{
    write_json_to(base_dir / stream_id / std::to_string(info.timestamp), constants::meta_filename, frame_info::to_json(info));
}

void ebu_list::write_packets(const path& packets_path, const packets& packets_info)
{
    json j;

    for (const auto& packet : packets_info)
    {
        json i;
        i["packet_time"] = to_date_time_string(packet.rtp.udp.packet_time);
        i["rtp_timestamp"] = packet.rtp.rtp.view().timestamp();
        i["sequence_number"] = packet.full_sequence_number;
        i["marker"] = packet.rtp.rtp.view().marker();
        i["lines"] = ebu_list::to_json(packet.line_info);
        j.push_back(i);
    }

    write_json_to(packets_path, packets_file_name, j);
}

//------------------------------------------------------------------------------

video_stream_serializer::video_stream_serializer(rtp::packet first_packet,
    serializable_stream_info info,
    video_stream_details details,
    completion_handler ch,
    path base_dir,
    executor_ptr main_executor)
    : video_stream_handler(std::move(first_packet), std::move(info), details, std::move(ch)),
    base_dir_(std::move(base_dir)),
    main_executor_(std::move(main_executor)),
    frame_size_(get_frame_size(details))
{
}

void video_stream_serializer::on_frame_started(const frame& f)
{
    frame_info fi{f.timestamp, 1};
    write_frame_info(base_dir_, this->network_info().id, fi);
    current_frame_packets_.clear();
}

struct png_write_info
{
    media::video::video_dimensions frame_size;
    oview data;
    path png_path;
};

struct packets_write_info
{
    path packets_path;
    packets frame_packets;
};

int64_t get_first_packet_timestamp(const packets& ps)
{
    if (ps.empty()) return 0;
    return std::chrono::duration_cast<std::chrono::nanoseconds>(ps.front().rtp.udp.packet_time.time_since_epoch()).count();
}

int64_t get_last_packet_timestamp(const packets& ps)
{
    if (ps.empty()) return 0;
    auto last = ps.rbegin();
    return std::chrono::duration_cast<std::chrono::nanoseconds>(last->rtp.udp.packet_time.time_since_epoch()).count();
}

void video_stream_serializer::on_frame_complete(frame_uptr&& f)
{
    const auto stream_id = this->network_info().id;
    const auto frame_id = std::to_string(f->timestamp);

    const auto info_base = base_dir_ / stream_id / frame_id;
    const auto png_path = info_base / "frame.png";
    const auto packets_path = base_dir_ / stream_id / frame_id;

    std::experimental::filesystem::create_directories(info_base);

    frame_info fi{ 
        f->timestamp, 
        current_frame_packets_.size(),
        get_first_packet_timestamp(current_frame_packets_),
        get_last_packet_timestamp(current_frame_packets_),
    };
    write_frame_info(base_dir_, stream_id, fi);

    packets_write_info pwi{ packets_path, std::move(current_frame_packets_) };

    auto packets_writer = [pwi]() mutable {

        write_packets(pwi.packets_path, pwi.frame_packets);
    };
    main_executor_->execute(std::move(packets_writer));

    png_write_info wfi { frame_size_, oview(f->buffer), png_path };

    auto png_writer = [wfi]() mutable {
        auto rgba = from_ycbcr422_to_rgba(wfi.data, wfi.frame_size);
        write_png(rgba, wfi.frame_size, wfi.png_path);
    };

    main_executor_->execute(std::move(png_writer));
}

void video_stream_serializer::on_packet(const packet_info& p)
{
    current_frame_packets_.push_back(p);
}

//------------------------------------------------------------------------------

c_inst_histogram_writer::c_inst_histogram_writer(path info_path)
    : info_path_(std::move(info_path))
{
}

void ebu_list::c_inst_histogram_writer::on_data(const st2110::d21::cinst_histogram_t& histogram)
{
    histogram_ = histogram;
}

void ebu_list::c_inst_histogram_writer::on_complete()
{
    json j;
    j["histogram"] = histogram_;

    write_json_to(info_path_, cinst_file_name, j);
}

void ebu_list::c_inst_histogram_writer::on_error(std::exception_ptr)
{
}
