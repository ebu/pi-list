#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/net/udp/listener.h"
#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/pcap/reader.h"

namespace ebu_list
{
    // TODO: move this to a common place
    using on_error_t = std::function<void(std::exception_ptr)>;
    void on_error_exit(std::exception_ptr e);
}

namespace ebu_list::pcap
{
    class pcap_player
    {
    public:
        pcap_player(path pcap_file, udp::listener_ptr listener, on_error_t on_error);
        pcap_player(path pcap_file, udp::listener_ptr listener, on_error_t on_error, clock::duration packet_timestamp_correction);

        bool next();
        void done();

        bool pcap_has_truncated_packets() const noexcept;

    private:
        void do_next();

        udp::listener_ptr listener_;
        on_error_t on_error_;
        const clock::duration packet_timestamp_correction_;
        sbuffer_factory_ptr bf_;
        chunked_data_source source_;
        maybe_header file_header_;
        std::atomic<bool> done_ = false;
        bool pcap_has_truncated_packets_ = false;
    };
}
