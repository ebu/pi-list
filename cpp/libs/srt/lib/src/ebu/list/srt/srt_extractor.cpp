#include "ebu/list/srt/srt_extractor.h"
#include "ebu/list/analysis/serialization/utils.h"
#include "ebu/list/analysis/serialization/video/st2110_d20_packet.h"
#include "ebu/list/analysis/utils/color_conversion.h"
#include "ebu/list/core/platform/file.h"
#include <cstdio>
#include <utility>

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using namespace srt;
using json = nlohmann::json;

srt_extractor::srt_extractor(udp::datagram first_datagram, path base_dir, executor_ptr main_executor,
                             std::string frame_id)
    : srt_decoder(std::move(first_datagram), [](const srt_decoder&) {}), base_dir_(std::move(base_dir)),
      main_executor_(std::move(main_executor)), frame_id_(std::move(frame_id))
{
}

void srt_extractor::on_frame_started(const frame_srt&)
{
}

void srt_extractor::on_packet(const packet_srt_info&)
{
}

void srt_extractor::on_frame_complete(frame_srt_uptr&& f)
{
    const auto frame_id = std::to_string(f->timestamp);

    const auto info_base = base_dir_ / frame_id_ / frame_id;

    const auto png_path = info_base / "frame.srt";

    std::experimental::filesystem::create_directories(info_base);

    struct write_info
    {
        size_t frame_size;
        std::vector<std::byte> data;
        path file_path;
    };

    write_info wfi{static_cast<size_t>(f->buffer.size()), f->buffer, png_path};

    auto png_writer = [wfi]() mutable {
        file_handle file(wfi.file_path, file_handle::mode::write);
        const auto count = fwrite(&wfi.data[0], 1, wfi.frame_size, file.handle());
        LIST_ENFORCE(count == wfi.frame_size, std::runtime_error, "Did not write the full PNG buffer");
    };

    main_executor_->execute(std::move(png_writer));
}
