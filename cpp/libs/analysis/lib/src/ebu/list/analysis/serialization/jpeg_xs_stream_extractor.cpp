#include "ebu/list/analysis/serialization/jpeg_xs_stream_extractor.h"

#include <utility>
#include "ebu/list/analysis/serialization/utils.h"
#include "ebu/list/analysis/serialization/video/st2110_d20_packet.h"
#include "ebu/list/analysis/utils/color_conversion.h"
#include "ebu/list/analysis/utils/png_writer.h"
#include <stdio.h>

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

jpeg_xs_stream_extractor::jpeg_xs_stream_extractor(rtp::packet first_packet, path base_dir, executor_ptr main_executor, std::string stream_id)
    : jpeg_xs_stream_handler(std::move(first_packet), [](const jpeg_xs_stream_handler&) {}),
      base_dir_(std::move(base_dir)), main_executor_(std::move(main_executor)), stream_id_(std::move(stream_id))
{
}

void jpeg_xs_stream_extractor::on_frame_started(const frame&)
{
}

void jpeg_xs_stream_extractor::on_packet(const packet_info&)
{
}

void jpeg_xs_stream_extractor::on_frame_complete(frame_uptr&& f)
{
    const auto frame_id  = std::to_string(f->timestamp);

    const auto info_base = base_dir_ / stream_id_ / frame_id;

    const auto png_path = info_base / "frame.png";

    std::experimental::filesystem::create_directories(info_base);

    struct png_write_info
    {
        long frame_size;
        oview data;
        path png_path;
    };

    png_write_info wfi{f->buffer->size(), oview(f->buffer), png_path};

    const auto size = f->buffer->size();
    const auto buffer = oview(f->buffer);

    auto png_writer = [png_path, buffer, size]() mutable {
        file_handle file(png_path, file_handle::mode::write);
        const auto count = fwrite(buffer, 1, size, file.handle());
        LIST_ENFORCE(count == size, std::runtime_error, "Did not write the full PNG buffer");
    };

    main_executor_->execute(std::move(png_writer));
}
