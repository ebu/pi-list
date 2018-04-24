#include "udp_sender.h"

using namespace ebu_list;

udp_sender::udp_sender(ipv4::address address, std::optional<port> p)
    : udp_sender_(), address_(address), port_(std::move(p))
{
}

udp_sender::udp_sender(const std::string& address, std::optional<uint16_t> p)
    : udp_sender(ipv4::from_dotted_string(address), p ? std::optional<port>{ to_port(p.value()) } : std::nullopt )
{
}

void udp_sender::on_data(udp::datagram&& datagram)
{
    datagrams_.push_back(std::move(datagram));
}

void udp_sender::on_complete()
{
    if( datagrams_.empty() ) return;

    const auto default_port = datagrams_.at(0).info.destination_port;
    ipv4::endpoint endpoint {address_, port_.value_or(default_port)};

    logger()->info("Sending packets to {}", to_string(endpoint));
    for(const auto& datagram: datagrams_)
    {
        udp_sender_.send_data(datagram.sdu.view(), endpoint);
    }
}

void udp_sender::on_error(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch (std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}