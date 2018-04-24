#pragma once

#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/rtp/decoder.h"
#include "ebu/list/pcap/reader.h"

namespace ebu_list::test
{
    class rtp_source
    {
    public:
        explicit rtp_source(path pcap_file);

        rtp::maybe_packet next();

    private:
        sbuffer_factory_ptr bf_;
        chunked_data_source source_;
        pcap::maybe_header file_header_;
    };
}
