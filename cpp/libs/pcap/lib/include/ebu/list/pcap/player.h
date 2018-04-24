#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/net/udp/listener.h"
#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/pcap/reader.h"

namespace ebu_list::pcap
{
    class pcap_player
    {
    public:
        pcap_player(path pcap_file, udp::listener_ptr listener);
        pcap_player(path pcap_file, udp::listener_ptr listener, clock::duration packet_timestamp_correction);

        bool next();

    private:
        void do_next();

        udp::listener_ptr listener_;
        const clock::duration packet_timestamp_correction_;
        sbuffer_factory_ptr bf_;
        chunked_data_source source_;
        maybe_header file_header_;
        std::atomic<bool> done_ = false;
    };
}
