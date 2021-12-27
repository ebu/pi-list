#pragma once

#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/pcap/reader.h"
#include "ebu/list/rtp/decoder.h"

namespace ebu_list::test
{
    class udp_source
    {
      public:
        explicit udp_source(path pcap_file);

        udp::maybe_datagram next();

      private:
        sbuffer_factory_ptr bf_;
        chunked_data_source source_;
        pcap::maybe_header file_header_;
    };
} // namespace ebu_list::test
