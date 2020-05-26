#include "bisect/bicla.h"
#include "cli_config.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/io/logger.h"
#include "ebu/list/st2022_7/analysis.h"
#include "ebu/list/version.h"
#include <fstream>

using namespace ebu_list;
using nlohmann::json;

//------------------------------------------------------------------------------

namespace
{
    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        auto [parse_result, config] =
            parse(argc, argv,
                  argument(&config::request_file, "request file", "the JSON file with the configuration information"),
                  argument(&config::response_file, "response file", "the output JSON file"));

        if(parse_result) return config;

        logger()->error("usage: {} {}", argv[0], to_string(parse_result));
        exit(-1);
    }

    void run(const config& config)
    {
        std::ifstream ifs(config.request_file);
        LIST_ENFORCE(ifs.is_open(), std::runtime_error, "Failed to open the request file: '{config.request_file}'");
        auto request = json::parse(ifs);
        logger()->info("Request: {}", request.dump());

        const auto response = st2022_7::analyse(request);

        std::ofstream ofs(config.response_file);
        ofs << response.dump();
    }
} // namespace

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    logger()->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    try
    {
        const auto start_time = std::chrono::steady_clock::now();

        run(config);

        const auto end_time        = std::chrono::steady_clock::now();
        const auto processing_time = end_time - start_time;
        const auto processing_time_ms =
            static_cast<double>(std::chrono::duration_cast<std::chrono::milliseconds>(processing_time).count());
        logger()->info("Processing time: {:.3f} s", processing_time_ms / 1000.0);
    }
    catch(std::exception& ex)
    {
        logger()->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}
