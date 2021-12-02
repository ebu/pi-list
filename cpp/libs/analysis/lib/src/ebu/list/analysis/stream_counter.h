#pragma once

#include "ebu/list/analysis/serialization/compliance.h"
#include "ebu/list/analysis/serialization/pcap.h"
#include "ebu/list/st2110/d21/settings.h"

namespace ebu_list::analysis
{
    class stream_counter
    {
      public:
        void handle_video_completed(const st2110::d21::video_analysis_info& info)
        {
            ++nr_total;
            ++nr_video;

            using st2110::d21::compliance_profile;

            switch(info.compliance)
            {
            case compliance_profile::narrow: ++nr_narrow; break;
            case compliance_profile::narrow_linear: ++nr_narrow_linear; break;
            case compliance_profile::wide: ++nr_wide; break;
            case compliance_profile::not_compliant: ++nr_not_compliant; break;
            }
        }

        void handle_audio_completed()
        {
            ++nr_total;
            ++nr_audio;
        }

        void handle_anc_completed()
        {
            ++nr_total;
            ++nr_anc;
        }

        void handle_ttml_completed()
        {
            ++nr_total;
            ++nr_anc; // TODO: TTML is being treated as ANC
        }

        void handle_unknown() { ++nr_total; }

        void fill_streams_summary(pcap_info& pcap)
        {
            pcap.audio_streams         = nr_audio.load();
            pcap.video_streams         = nr_video.load();
            pcap.anc_streams           = nr_anc.load();
            pcap.total_streams         = nr_total.load();
            pcap.wide_streams          = nr_wide.load();
            pcap.narrow_streams        = nr_narrow.load();
            pcap.narrow_linear_streams = nr_narrow_linear.load();
            pcap.not_compliant_streams = nr_not_compliant.load();
        }

      private:
        std::atomic_int nr_audio = 0;
        std::atomic_int nr_video = 0;
        std::atomic_int nr_anc   = 0;
        std::atomic_int nr_total = 0;

        std::atomic_int nr_wide          = 0;
        std::atomic_int nr_narrow        = 0;
        std::atomic_int nr_narrow_linear = 0;
        std::atomic_int nr_not_compliant = 0;
    };
} // namespace ebu_list::analysis
