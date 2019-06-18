#include "video_stream_serializer.h"
#include "png_writer.h"
#include "color_conversion.h"
#include "ebu/list/serialization/utils.h"
#include "ebu/list/serialization/video/st2110_d20_packet.h"
#include "ebu/list/serialization/compliance.h"
#include "ebu/list/constants.h"

using namespace ebu_list;
using namespace ebu_list::st2110;
using json = nlohmann::json;

//------------------------------------------------------------------------------

namespace
{
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
        const st2110_d20_packet p{ rtp_packet::build_from(packet.rtp), packet.full_sequence_number, packet.line_info };
        j.push_back(st2110_d20_packet::to_json(p));
    }

    write_json_to(packets_path, constants::packets_file_name, j);
}

//------------------------------------------------------------------------------

video_stream_serializer::video_stream_serializer(rtp::packet first_packet,
    serializable_stream_info info,
    video_stream_details details,
    path base_dir,
    executor_ptr main_executor,
    completion_callback on_complete_callback)
    : video_stream_handler(decode_video::yes, std::move(first_packet), std::move(info), details, std::bind(&video_stream_serializer::on_complete, this, std::placeholders::_1)),
    base_dir_(std::move(base_dir)),
    main_executor_(std::move(main_executor)),
    frame_size_(get_frame_size(details)),
    on_complete_callback_(on_complete_callback),
    compliance_(d21::build_compliance_analyzer(details.video, {
            details.video.schedule,
            d21::tvd_kind::ideal,
            std::nullopt
            }))
{
}

void video_stream_serializer::on_frame_started(const frame& f)
{
    frame_info fi{ f.timestamp, 1 };
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

void video_stream_serializer::on_packet(const packet_info& p)
{
    current_frame_packets_.push_back(p);
    compliance_.handle_packet(p.packet.info);
}

void video_stream_serializer::on_frame_complete(frame_uptr&& f)
{
    const auto stream_id = this->network_info().id;
    const auto frame_id = std::to_string(f->timestamp);

    const auto info_base = base_dir_ / stream_id / frame_id;
    const auto png_path = info_base / "frame.png";

    std::experimental::filesystem::create_directories(info_base);

    frame_info fi{
        f->timestamp,
        current_frame_packets_.size(),
        get_first_packet_timestamp(current_frame_packets_),
        get_last_packet_timestamp(current_frame_packets_),
    };
    write_frame_info(base_dir_, stream_id, fi);

    packets_write_info pwi{ info_base, std::move(current_frame_packets_) };

    auto packets_writer = [pwi]() mutable {

        write_packets(pwi.packets_path, pwi.frame_packets);
    };
    main_executor_->execute(std::move(packets_writer));

    png_write_info wfi{ frame_size_, oview(f->buffer), png_path };

    auto png_writer = [wfi]() mutable {
        auto rgba = from_ycbcr422_to_rgba(wfi.data, wfi.frame_size);
        write_png(rgba, wfi.frame_size, wfi.png_path);
    };

    main_executor_->execute(std::move(png_writer));
}

void video_stream_serializer::on_complete(const video_stream_handler&)
{
    on_complete_callback_(*this);
}

st2110::d21::video_analysis_info video_stream_serializer::get_video_analysis_info() const
{
    return st2110::d21::get_video_analysis_info(compliance_);
}

//------------------------------------------------------------------------------

histogram_writer::histogram_writer(path info_path, std::string_view filename)
    : info_path_(std::move(info_path)),
    filename_(filename)
{
}

void histogram_writer::on_data(const st2110::d21::cinst_histogram_t& histogram)
{
    json j;
    j["histogram"] = histogram;

    write_json_to(info_path_, filename_, j);
}

void histogram_writer::on_complete()
{
}

void histogram_writer::on_error(std::exception_ptr)
{
}
