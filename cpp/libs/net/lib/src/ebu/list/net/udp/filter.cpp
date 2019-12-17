#include "ebu/list/net/udp/filter.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::udp;

//------------------------------------------------------------------------------
namespace
{
    ipv4::endpoint_list to_endpoint_list(ipv4::address wanted_address, port wanted_port)
    {
        return ipv4::endpoint_list{{wanted_address, wanted_port}};
    }
} // namespace
//------------------------------------------------------------------------------

udp_filter::udp_filter(listener_ptr l, ipv4::address wanted_address, port wanted_port)
    : udp_filter(l, to_endpoint_list(wanted_address, wanted_port))
{
}

udp_filter::udp_filter(listener_ptr l, ipv4::endpoint_list wanted_endpoints)
    : listener_(std::move(l)), wanted_endpoints_(wanted_endpoints)
{
    LIST_ENFORCE(listener_ != nullptr, std::runtime_error, "listener can't be null");
}

void udp_filter::on_data(datagram&& datagram)
{
    for(const auto& wanted : wanted_endpoints_)
    {
        if(datagram.info.destination_address != wanted.addr) continue;
        if(datagram.info.destination_port != wanted.p) continue;
        listener_->on_data(std::move(datagram));

        return;
    }
}

void udp_filter::on_complete()
{
    listener_->on_complete();
}

void udp_filter::on_error(std::exception_ptr e)
{
    listener_->on_error(e);
}
