#pragma once

#include "ebu/list/st2022_7/pcap_reader.h"

namespace ebu_list
{
    class filtered_pcap_reader
    {
      public:
        explicit filtered_pcap_reader(pcap_reader_uptr&& source, ipv4::address source_address,
                                      ipv4::endpoint destination_endpoint);

        std::optional<rtp::packet> next();

      private:
        const pcap_reader_uptr source_;
        const ipv4::address source_address_;
        const ipv4::endpoint destination_endpoint_;

        bool filter(const rtp::packet& packet);
    };

    using filtered_pcap_reader_uptr = std::unique_ptr<filtered_pcap_reader>;
} // namespace ebu_list
