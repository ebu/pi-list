#pragma once

#include "ebu/list/st2022_7/filtered_pcap_reader.h"

namespace ebu_list
{
    class caching_pcap_reader
    {
      public:
        explicit caching_pcap_reader(filtered_pcap_reader_uptr&& source);

        const std::optional<rtp::packet>& current() const noexcept;
        void next();

      private:
        const filtered_pcap_reader_uptr source_;
        std::optional<rtp::packet> next_;
    };
} // namespace ebu_list
