#include "ebu/list/net/udp/receiver.h"

#pragma warning(push)
#pragma warning(disable: 4834)
#include "boost/asio.hpp"
#pragma warning(pop)

using namespace ebu_list;
using namespace ebu_list::udp;

namespace bai = boost::asio::ip;

constexpr unsigned short max_packet_size = 1900; // todo: check UDP STANDARD SIZE

struct receiver::impl
{
    boost::asio::io_context io_context_;
    bai::udp::socket socket_;

    const listener_uptr listener_;

    const ipv4::address dest_addr; // temporary?

    malloc_sbuffer_factory factory_;

    impl(listener_uptr l, const std::string& address, uint16_t port) :
        io_context_()
        , socket_(io_context_
        , bai::udp::endpoint(bai::udp::v4(), port))
        , listener_(std::move(l))
        , dest_addr(ipv4::from_dotted_string(address))
    {
        // Join the multicast group.
        socket_.set_option(bai::multicast::join_group(bai::make_address(address)));
    }

    ~impl()
    {
        // todo: unsubscribe multicast address
        listener_->on_complete();
    }

    void do_receive()
    {
        auto buffer = factory_.get_buffer(max_packet_size);
        auto span = bisect::bimo::as_span(*buffer);

        bai::udp::endpoint sender_endpoint;
        socket_.async_receive_from(
                boost::asio::buffer(span.data(), span.size()), sender_endpoint,
                [=](boost::system::error_code ec, std::size_t length) mutable
                {
                    if (!ec)
                    {
                        auto source_addr = ipv4::from_dotted_string(sender_endpoint.address().to_string());

                        auto ipv4_payload = bisect::bimo::owning_view(buffer, 0, length);

                        auto[udp_header, udp_payload] = udp::decode(std::move(ipv4_payload));

                        auto packet_timestamp = ebu_list::clock::now(); //todo: get me from IP header
                        auto datagram = udp::make_datagram(packet_timestamp,
                                                           source_addr, udp_header.source_port,
                                                           dest_addr, udp_header.destination_port,
                                                           std::move(udp_payload));

                        listener_->on_data(std::move(datagram));
                        do_receive(); //register callback again
                    }
                    else
                    {
                        // todo: do something
                        //listener_->on_error();
                    }
                });
    }
};

receiver::receiver(listener_uptr l, const std::string& address, uint16_t port)
    : pimpl_(std::make_unique<impl>(std::move(l), address, port))
{
    pimpl_->do_receive();
    pimpl_->io_context_.run();
}

receiver::~receiver()
{
}
