#include "ebu/list/net/udp/sender.h"

#pragma warning(push)
#pragma warning(disable: 4834)
#include "boost/asio.hpp"
#pragma warning(pop)

using namespace ebu_list;
using namespace ebu_list::udp;

namespace bai = boost::asio::ip;

struct sender::impl
{
    boost::asio::io_service io_service_;
    bai::udp::socket socket_;

    impl() : io_service_(), socket_(io_service_, bai::udp::endpoint(bai::udp::v4(), 0))
    {
    }
};

sender::sender() : pimpl_(std::make_unique<impl>())
{
}

sender::~sender()
{
    pimpl_->socket_.close();
}

void sender::send_data(cbyte_span msg, const ipv4::endpoint& endpoint)
{
    const auto address = to_string(endpoint.addr);
    const auto port = to_string(endpoint.p);

    send_data(msg, address, port);
}

void sender::send_data(cbyte_span msg, const std::string& address, const std::string& port)
{
    bai::udp::resolver resolver(pimpl_->io_service_);
    bai::udp::resolver::query query(bai::udp::v4(), address, port);
    auto endpoint_iter = resolver.resolve(query);

    pimpl_->socket_.send_to(boost::asio::buffer(msg.data(), msg.size()), *endpoint_iter);
}
