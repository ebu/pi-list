#include "ebu/list/st2022_7/filtered_pcap_reader.h"

using namespace ebu_list;

///////////////////////////////////////////////////////////////////////////////
namespace
{
} // namespace
///////////////////////////////////////////////////////////////////////////////

filtered_pcap_reader::filtered_pcap_reader(pcap_reader_uptr&& source, ipv4::address source_address,
                                           ipv4::endpoint destination_endpoint)
    : source_(std::move(source)), source_address_(source_address), destination_endpoint_(destination_endpoint)
{
}

std::optional<rtp::packet> filtered_pcap_reader::next()
{
    for(;;)
    {
        const auto p = source_->next();
        if(!p) return p;
        auto packet = std::move(p.value());
        if(!filter(packet)) continue;
        return packet;
    }
}

bool filtered_pcap_reader::filter(const rtp::packet& packet)
{
    //            logger()->info("Checking {}->{}:{} against {}->{}:{}", packet.info.udp.source_address,
    //                           packet.info.udp.destination_address, packet.info.udp.destination_port,
    //                           source_address_, destination_endpoint_.addr, destination_endpoint_.p);

    if(packet.info.udp.source_address != source_address_) return false;
    if(packet.info.udp.destination_address != destination_endpoint_.addr) return false;
    return packet.info.udp.destination_port == destination_endpoint_.p;
}
