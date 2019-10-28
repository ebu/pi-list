#pragma once

#include "ebu/list/core/media/video_description.h"
#include "ebu/list/sdp/media_description.h"
#include "ebu/list/st2110/d10/network.h"
#include "ebu/list/st2110/d21/settings.h"

namespace ebu_list::st2110::d20
{
    namespace video = ebu_list::media::video;

    struct video_description : d10::stream_information
    {
        // obligatory
        video::video_sampling sampling{};
        uint16_t color_depth = 0;
        video::video_dimensions dimensions{0, 0};
        video::Rate rate = video::Rate(0, 1);
        video::colorimetry colorimetry{};
        st2110::d21::read_schedule schedule{};

        int packets_per_frame = 0;

        // optional
        video::scan_type scan_type = video::scan_type::PROGRESSIVE;
        // TCS
        // RANGE
        // PAR

        int64_t avg_tro_ns     = 0;
        int64_t max_tro_ns     = 0;
        int64_t min_tro_ns     = 0;
        int64_t tro_default_ns = 0;
    };

    media::video::info get_info(st2110::d20::video_description video);

    struct st2110_20_sdp_serializer
    {
        explicit st2110_20_sdp_serializer(const video_description& video_des);
        void write_rtpmap_line(std::vector<std::string>& current_lines,
                               const ebu_list::media::network_media_description& media_description);
        void additional_attributes(std::vector<std::string>& current_lines,
                                   const media::network_media_description& media_description);

      private:
        const video_description& video_desc_;
    };
} // namespace ebu_list::st2110::d20
