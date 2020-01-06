#include "ebu/list/analysis/serialization/ttml_stream_serializer.h"
#include "ebu/list/analysis/utils/histogram_listener.h"
#include <fstream>
using namespace ebu_list;
using namespace ebu_list::analysis::ttml;
using json = nlohmann::json;

namespace
{
    constexpr auto ttml_files_dir_name = "ttml-data";
}

stream_serializer::stream_serializer(const path& storage_folder, const std::string& stream_id)
    : storage_folder_(storage_folder), stream_id_(stream_id)
{
}

void stream_serializer::on_data(uint32_t rtp_timestamp, std::string ttml_doc)
{
    const auto base_dir = storage_folder_ / stream_id_ / ttml_files_dir_name;

    if(!std::experimental::filesystem::is_directory(base_dir))
    {
        std::experimental::filesystem::create_directories(base_dir);
    }

    const auto filename = fmt::format("{}.json", counter_);

    json j;
    j["rtp_timestamp"] = std::to_string(rtp_timestamp);
    j["xml"] = ttml_doc;

    const auto p = base_dir / filename;
    std::ofstream os(p);
    LIST_ENFORCE(os.is_open(), std::runtime_error, "Error opening file: {}", p);

    os << j.dump();

    ++counter_;
}

void stream_serializer::on_complete()
{
}

void stream_serializer::on_error(std::exception_ptr /*e*/)
{
}
