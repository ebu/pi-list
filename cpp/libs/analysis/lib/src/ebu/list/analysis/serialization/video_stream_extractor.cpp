#include "ebu/list/analysis/serialization/video_stream_extractor.h"
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
    media::video::video_dimensions get_frame_size(const video_stream_details& info)
    {
        auto dimensions = info.video.dimensions;
        if(info.video.scan_type == media::video::scan_type::INTERLACED)
        {
            dimensions.height /= 2;
        }

        return dimensions;
    }
} // namespace

//------------------------------------------------------------------------------

video_stream_extractor::video_stream_extractor(rtp::packet first_packet, serializable_stream_info info,
                                               video_stream_details details, path base_dir, executor_ptr main_executor)
    : video_stream_handler(decode_video::yes, std::move(first_packet), std::move(info), details,
                           [](const video_stream_handler&) {}),
      base_dir_(std::move(base_dir)), main_executor_(std::move(main_executor)), frame_size_(get_frame_size(details))
{
}

void video_stream_extractor::on_frame_started(const frame&)
{
}

void video_stream_extractor::on_packet(const packet_info&)
{
}

void video_stream_extractor::on_frame_complete(frame_uptr&& f)
{
    const auto stream_id = this->network_info().id;
    const auto frame_id  = std::to_string(f->timestamp);

    const auto info_base = base_dir_ / stream_id / frame_id;

    const auto png_path = info_base / "frame.png";

    std::experimental::filesystem::create_directories(info_base);

    struct png_write_info
    {
        media::video::video_dimensions frame_size;
        oview data;
        path png_path;
    };

    png_write_info wfi{frame_size_, oview(f->buffer), png_path};

    auto png_writer = [wfi]() mutable {
        auto rgba = from_ycbcr422_to_rgba(wfi.data, wfi.frame_size);
        write_png(rgba, wfi.frame_size, wfi.png_path);
    };

    main_executor_->execute(std::move(png_writer));
}
