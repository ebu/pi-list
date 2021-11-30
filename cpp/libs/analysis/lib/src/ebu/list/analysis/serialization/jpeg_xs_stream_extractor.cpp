#include "ebu/list/analysis/serialization/jpeg_xs_stream_extractor.h"
#include <utility>
#include <cstdio>
#include "ebu/list/analysis/serialization/utils.h"
#include "ebu/list/analysis/serialization/video/st2110_d20_packet.h"
#include "ebu/list/analysis/utils/color_conversion.h"
#include "ebu/list/core/platform/file.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using json = nlohmann::json;

jpeg_xs_stream_extractor::jpeg_xs_stream_extractor(rtp::packet first_packet, path base_dir, executor_ptr main_executor, std::string stream_id)
    : jpeg_xs_stream_handler(std::move(first_packet), [](const jpeg_xs_stream_handler&) {}),
      base_dir_(std::move(base_dir)), main_executor_(std::move(main_executor)), stream_id_(std::move(stream_id))
{
}

void jpeg_xs_stream_extractor::on_frame_started(const frame_jpeg_xs&)
{
}

void jpeg_xs_stream_extractor::on_packet(const packet_jpeg_xs_info&)
{
}

void jpeg_xs_stream_extractor::on_frame_complete(frame_jpeg_xs_uptr&& f)
{
    const auto frame_id  = std::to_string(f->timestamp);

    const auto info_base = base_dir_ / stream_id_ / frame_id;

    const auto png_path = info_base / "frame.png";

    std::experimental::filesystem::create_directories(info_base);

    struct write_info
    {
        size_t frame_size;
        oview data;
        path file_path;
    };

    write_info wfi{static_cast<size_t>(f->buffer->size()), oview(f->buffer), png_path};

    auto png_writer = [wfi]() mutable {
        file_handle file(wfi.file_path, file_handle::mode::write);
        const auto count = fwrite(&wfi.data, 1, wfi.frame_size, file.handle());
        LIST_ENFORCE(count == wfi.frame_size, std::runtime_error, "Did not write the full PNG buffer");
    };

    main_executor_->execute(std::move(png_writer));
}
