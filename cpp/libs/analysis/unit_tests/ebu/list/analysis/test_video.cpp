#include "catch2/catch.hpp"
#include "ebu/list/analysis/full_analysis.h"
#include "ebu/list/test_lib/sample_files.h"
#include "fs_handler_factory.h"

using namespace ebu_list;
using namespace ebu_list::analysis;

//------------------------------------------------------------------------------
namespace
{
    std::optional<stream_with_details> get_stream_info(const rtp::packet& /*first_packet*/)
    {
        auto stream_info                      = serializable_stream_info{};
        stream_info.type                      = media::media_type::VIDEO;
        auto video_details                    = video_stream_details{};
        video_details.video.avg_tro_ns        = 60954;
        video_details.video.color_depth       = 10;
        video_details.video.colorimetry       = media::video::colorimetry::BT709;
        video_details.video.dimensions.height = 576;
        video_details.video.max_tro_ns        = 61268;
        video_details.video.min_tro_ns        = 60598;
        video_details.video.packets_per_frame = 384;
        video_details.video.rate              = fraction64(50);
        video_details.video.sampling          = media::video::video_sampling::YCbCr_4_2_2;
        video_details.video.scan_type         = media::video::scan_type::INTERLACED;
        video_details.video.schedule          = st2110::d21::read_schedule::linear;
        video_details.video.tro_default_ns    = 1664000;
        video_details.video.dimensions.width  = 720;
        const auto s                          = stream_with_details{stream_info, video_details};
        return s;
    }
} // namespace
//------------------------------------------------------------------------------

SCENARIO("Video stream analysis")
{
    GIVEN("a pcap file with 1 PAL SD video stream")
    {
        const auto pcap_file      = test_lib::sample_file("pcap/st2110/2110-20/2110-20_625i50.pcap");
        const auto storage_folder = path("/tmp");
        auto pcap                 = pcap_info{};

        WHEN("the file is analysed")
        {
            fs_handler_factory handler_factory(storage_folder);
            fs_updater updater(storage_folder);
            analysis_profile profile;
            profile.timestamps.source = timestamps_source::pcap;

            auto callback = [](float) {};
            auto context  = processing_context{pcap_file,       profile,          storage_folder, pcap,
                                              get_stream_info, &handler_factory, &updater,       callback};

            run_full_analysis(context);
        }
    }
}
