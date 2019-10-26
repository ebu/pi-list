#pragma once

#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/core/media/video_description.h"
#include "ebu/list/sdp/media_description.h"
#include "ebu/list/st2110/d10/network.h"
#include "ebu/list/st2110/d40/packet.h"

namespace ebu_list::st2110::d40
{
    namespace video = ebu_list::media::video;
    namespace anc   = ebu_list::media::anc;

    class anc_sub_sub_stream
    {
      public:
        anc_sub_sub_stream(std::string type);
        std::string type() const;
        std::string filename() const;
        bool operator==(const anc_sub_sub_stream& other);
        void write(ebu_list::path path) const;
        std::string decoded_data;

      private:
        std::string type_;
        ebu_list::path filename_;
    };

    class anc_sub_stream
    {
      private:
        void check();
        anc::did_sdid did_sdid_;
        uint8_t num_;
        uint16_t errors_;

      public:
        anc_sub_stream(uint16_t did_sdid, uint8_t num);
        anc::did_sdid did_sdid() const;
        uint8_t num() const;
        uint16_t errors() const;
        void errors(uint16_t err);
        std::string type() const;
        bool operator==(const anc_sub_stream& other);
        bool is_valid() const;
        void write(ebu_list::path path) const;

        uint16_t packet_count;
        std::vector<anc_sub_sub_stream> anc_sub_sub_streams;
    };

    struct anc_description : d10::stream_information
    {
        video::Rate rate           = video::Rate(0, 1);
        int packets_per_frame      = 0;
        video::scan_type scan_type = video::scan_type::PROGRESSIVE;
        std::vector<anc_sub_stream> sub_streams;
    };

    struct st2110_40_sdp_serializer
    {
        explicit st2110_40_sdp_serializer(const anc_description& anc_des);
        void write_rtpmap_line(std::vector<std::string>& current_lines,
                               const ebu_list::media::network_media_description& media_description);
        void additional_attributes(std::vector<std::string>& current_lines,
                                   const media::network_media_description& media_description);

      private:
        const anc_description& anc_desc_;
    };
} // namespace ebu_list::st2110::d40
