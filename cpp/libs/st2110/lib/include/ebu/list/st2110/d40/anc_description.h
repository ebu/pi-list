#pragma once

#include "ebu/list/core/media/video_description.h"
#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/sdp/media_description.h"
#include "ebu/list/st2110/d10/network.h"

namespace ebu_list::st2110::d40
{
    namespace video = ebu_list::media::video;
    namespace anc = ebu_list::media::anc;

    class anc_stream
    {
        public:
            anc_stream(uint8_t did, uint8_t sdid, uint8_t num);
            anc_stream(uint16_t did_sdid, uint8_t num);
            anc::did_sdid did_sdid() const;
            uint8_t num() const;
            std::string type() const;
            bool operator==(const anc_stream& other);
            bool is_valid() const;

        private:
            void check();
            anc::did_sdid did_sdid_;
            uint8_t num_;
            // add payload_
    };

    struct anc_description : d10::stream_information
    {
        video::Rate rate = video::Rate(0,1);
        std::vector<anc_stream> streams;
    };
}
