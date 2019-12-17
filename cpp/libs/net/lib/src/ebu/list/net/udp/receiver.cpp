#include "ebu/list/net/udp/receiver.h"

#pragma warning(push)
#pragma warning(disable : 4834)
#include "boost/asio.hpp"
#pragma warning(pop)

#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::udp;

namespace bai = boost::asio::ip;

constexpr unsigned short max_packet_size = 1900; // todo: check UDP STANDARD SIZE

struct receiver::impl
{
    boost::asio::io_context io_context_;
    bai::udp::socket socket_;

    const listener_uptr listener_;

    const ipv4::address dest_addr_;
    const port dest_port_;

    malloc_sbuffer_factory factory_; // todo: receive the factory from outside ?

    std::future<void> runner_;

    impl(listener_uptr l, const std::string& address, uint16_t port)
        : io_context_(), socket_(io_context_, bai::udp::endpoint(bai::udp::v4(), port)), listener_(std::move(l)),
          dest_addr_(ipv4::from_dotted_string(address)), dest_port_(to_port(port))
    {
        LIST_ENFORCE(listener_ != nullptr, std::runtime_error, "udp receiver listener not valid!");

        // Join the multicast group.
        socket_.set_option(bai::multicast::join_group(bai::make_address(ipv4::to_string(dest_addr_))));
    }

    ~impl()
    {
        // leave the multicast group
        socket_.set_option(bai::multicast::leave_group(bai::make_address(ipv4::to_string(dest_addr_))));

        listener_->on_complete();
    }

    void do_receive()
    {
        auto buffer = factory_.get_buffer(max_packet_size);
        auto span   = bisect::bimo::as_span(*buffer);

        bai::udp::endpoint sender_endpoint;
        socket_.async_receive_from(
            boost::asio::buffer(span.data(), span.size()), sender_endpoint,
            [=](boost::system::error_code ec, std::size_t length) mutable {
                if(!ec)
                {
                    auto source_addr = ipv4::from_dotted_string(sender_endpoint.address().to_string());
                    auto source_port = ebu_list::to_port(sender_endpoint.port());

                    auto udp_payload = bisect::bimo::owning_view(buffer, 0, length);

                    auto packet_timestamp        = ebu_list::clock::now(); // todo: get me from IP header
                    auto source_mac_address      = to_byte_array(0, 0, 0, 0, 0, 0);
                    auto destination_mac_address = to_byte_array(0, 0, 0, 0, 0, 0);
                    auto payload_type            = ethernet::payload_type::UNKNOWN;
                    auto datagram =
                        udp::make_datagram(packet_timestamp, source_mac_address, destination_mac_address, payload_type,
                                           source_addr, source_port, dest_addr_, dest_port_, std::move(udp_payload));

                    listener_->on_data(std::move(datagram));
                    do_receive(); // register callback again
                }
                else
                {
                    // todo: do something
                    // listener_->on_error();
                }
            });
    }
};

receiver::receiver(listener_uptr l, const std::string& address, uint16_t port)
    : pimpl_(std::make_unique<impl>(std::move(l), address, port))
{
    pimpl_->do_receive();
    pimpl_->runner_ = std::async(std::launch::async, [&]() { pimpl_->io_context_.run(); });
}

udp::receiver::receiver(listener_uptr l, ipv4::address dest_addr, port dest_port)
    : receiver(std::move(l), ipv4::to_string(dest_addr), to_native(dest_port))
{
}

receiver::~receiver()
{
    pimpl_->runner_.wait();
}

void udp::receiver::stop()
{
    pimpl_->io_context_.stop();
}
