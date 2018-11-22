#include "ebu/list/version.h"
#include "ebu/list/core/types.h"
#include "ebu/list/sdp/media_description.h"
#include "bisect/bicla.h"
#include "serializer.h"

using namespace ebu_list;

namespace
{
    struct config
    {
        path base_dir;
    };

    config parse_or_usage_and_exit(int argc, char const* const* argv)
    {
        using namespace bisect::bicla;

        const auto[parse_result, config] = parse(argc, argv,
            argument(&config::base_dir, "base dir", "the path to the directory where the information will be written")
        );

        if (parse_result) return config;

        logger()->error("usage: {} {}", path(argv[0]).filename().string(), to_string(parse_result));
        exit(-1);
    }

    void run(const config& config)
    {
        write_available_options(config.base_dir);
        write_available_options_for_video(config.base_dir);
        write_available_options_for_audio(config.base_dir);
        write_available_options_for_ancillary(config.base_dir);
    }
}

//------------------------------------------------------------------------------

int main(int argc, char* argv[])
{
    auto console = logger();
    console->info("Based on EBU LIST v{}", ebu_list::version());

    const auto config = parse_or_usage_and_exit(argc, argv);

    try
    {
        run(config);
    }
    catch (std::exception& ex)
    {
        console->error("exception: {}", ex.what());
        return -1;
    }

    return 0;
}