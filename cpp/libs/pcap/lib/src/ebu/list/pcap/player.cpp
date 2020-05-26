#include "ebu/list/pcap/player.h"
#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/net/ethernet/decoder.h"
#include "ebu/list/net/ipv4/decoder.h"
#include "ebu/list/net/udp/decoder.h"
#include "ebu/list/pcap/reader.h"

using namespace ebu_list::pcap;
using namespace ebu_list;

//------------------------------------------------------------------------------
void ebu_list::on_error_exit(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch(std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
        std::exit(-1);
    }
}

//------------------------------------------------------------------------------

pcap_player::pcap_player(path pcap_file, udp::listener_ptr listener, on_error_t on_error,
                         clock::duration packet_timestamp_correction)
    : listener_(std::move(listener)), on_error_(std::move(on_error)),
      packet_timestamp_correction_(packet_timestamp_correction), bf_(std::make_shared<malloc_sbuffer_factory>()),
      source_(bf_, std::make_unique<file_source>(bf_, pcap_file)), file_header_(pcap::read_header(source_))
{
    if(!file_header_)
    {
        done_ = true;
        logger()->critical("Not a valid pcap file");
        return;
    }
}

pcap_player::pcap_player(path pcap_file, udp::listener_ptr listener, on_error_t on_error)
    : pcap_player(std::move(pcap_file), std::move(listener), on_error, clock::duration{})
{
}

void pcap_player::done()
{
    if(done_) return;
    done_ = true;
    listener_->on_complete();
}

bool pcap_player::pcap_has_truncated_packets() const noexcept
{
    return pcap_has_truncated_packets_;
}

bool pcap_player::next()
{
    if(done_) return false;

    try
    {
        do_next();
    }
    catch(...)
    {
        on_error_(std::current_exception());
        return false;
    }

    return !done_;
}

void pcap_player::do_next()
{
    while(!done_)
    {
        auto maybe_packet = pcap::read_packet(file_header_.value()(), source_);
        if(!maybe_packet)
        {
            listener_->on_complete();
            done_ = true;
            return;
        }

        auto& packet = maybe_packet.value();
        if(packet.was_padded)
        {
            pcap_has_truncated_packets_ = true;
        }

        const auto packet_timestamp = packet.pcap_header.view().timestamp() + packet_timestamp_correction_;

        auto [ethernet_header, ethernet_payload] = ethernet::decode(std::move(packet.data));
        if(ethernet_header.type != ethernet::payload_type::IPv4) continue;

        auto [ipv4_header, ipv4_payload] = ipv4::decode(std::move(ethernet_payload));
        if(ipv4_header.type != ipv4::protocol_type::UDP) continue;

        auto [udp_header, udp_payload] = udp::decode(std::move(ipv4_payload));

        ipv4::packet_info ipv4_info{ipv4_header, packet_timestamp};
        auto datagram = udp::make_datagram(ethernet_header.source_address, ethernet_header.destination_address,
                                           ethernet_header.type, ipv4_info, udp_header.source_port,
                                           udp_header.destination_port, std::move(udp_payload));

        listener_->on_data(std::move(datagram));

        return;
    }
}
