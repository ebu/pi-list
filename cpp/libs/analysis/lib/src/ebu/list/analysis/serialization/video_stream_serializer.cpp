#include "ebu/list/analysis/serialization/video_stream_serializer.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/analysis/serialization/compliance.h"
#include "ebu/list/analysis/serialization/utils.h"
#include "ebu/list/analysis/serialization/video/st2110_d20_packet.h"
#include "ebu/list/analysis/utils/color_conversion.h"
#include "ebu/list/analysis/utils/png_writer.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using json = nlohmann::json;

//------------------------------------------------------------------------------

namespace
{
    void write_frame_info(const path& base_dir, const std::string& stream_id, const frame_info& info)
    {
        write_json_to(base_dir / stream_id / std::to_string(info.timestamp), constants::meta_filename,
                      frame_info::to_json(info));
    }
} // namespace

//------------------------------------------------------------------------------

video_stream_serializer::video_stream_serializer(rtp::packet first_packet, serializable_stream_info info,
                                                 video_stream_details details, path base_dir,
                                                 completion_callback on_complete_callback)
    : video_stream_handler(decode_video::no, std::move(first_packet), std::move(info), details,
                           [this, on_complete_callback](const video_stream_handler&) { on_complete_callback(*this); }),
      base_dir_(std::move(base_dir)), compliance_(d21::build_compliance_analyzer(
                                          details.video, {details.video.schedule, d21::tvd_kind::ideal, std::nullopt}, d21::vrx_analysis_mode_t::enabled))
{
}

void video_stream_serializer::on_frame_started(const frame& f)
{
    frame_info fi{f.timestamp, 1};
    write_frame_info(base_dir_, this->network_info().id, fi);
    frame_info_.reset();
}

void video_stream_serializer::on_packet(const packet_info& p)
{
    mac_analyzer_.on_data(p.packet);
    frame_info_.on_packet(p);
    compliance_.handle_packet(p.packet.info);
}

void video_stream_serializer::on_frame_complete(frame_uptr&& f)
{
    const auto stream_id = this->network_info().id;
    const auto frame_id  = std::to_string(f->timestamp);
    const auto info_base = base_dir_ / stream_id / frame_id;
    const auto png_path  = info_base / "frame.png";

    std::experimental::filesystem::create_directories(info_base);

    frame_info fi{
        f->timestamp,
        frame_info_.get_packet_count(),
        frame_info_.get_first_packet_timestamp(),
        frame_info_.get_last_packet_timestamp(),
    };
    write_frame_info(base_dir_, stream_id, fi);
}

mac_address_analyzer::mac_addresses_info video_stream_serializer::get_mac_adresses_analyses() const
{
    return mac_analyzer_.get_mac_addresses_analysis();
}

st2110::d21::video_analysis_info video_stream_serializer::get_video_analysis_info() const
{
    return st2110::d21::get_video_analysis_info(compliance_);
}
