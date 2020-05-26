#pragma once

#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/pcap/file_header.h"
#include "ebu/list/rtp/decoder.h"
#include <memory>
#include <string_view>

namespace ebu_list
{
    class pcap_reader
    {
      public:
        explicit pcap_reader(std::string_view pcap_file);
        pcap_reader(pcap_reader&) = delete;
        pcap_reader& operator=(pcap_reader&) = delete;
        pcap_reader(pcap_reader&&)           = delete;
        pcap_reader& operator=(pcap_reader&&) = delete;
        ~pcap_reader()                        = default;

        std::optional<rtp::packet> next();

      private:
        sbuffer_factory_ptr factory = std::make_shared<malloc_sbuffer_factory>();
        chunked_data_source source_;
        const pcap::file_header header_;
    };

    using pcap_reader_uptr = std::unique_ptr<pcap_reader>;
} // namespace ebu_list
