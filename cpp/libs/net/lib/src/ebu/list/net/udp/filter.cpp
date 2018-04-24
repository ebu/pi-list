#include "ebu/list/net/udp/filter.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;
using namespace ebu_list::udp;

//------------------------------------------------------------------------------

udp_filter::udp_filter(listener_ptr l, ipv4::address wanted_address, port wanted_port)
    : listener_(std::move(l)),
    wanted_address_(wanted_address),
    wanted_port_(wanted_port)
{
    LIST_ENFORCE(listener_ != nullptr, std::runtime_error, "listener can't be null");
}

void udp_filter::on_data(datagram&& datagram)
{
    if (datagram.info.destination_address != wanted_address_) return;
    if (datagram.info.destination_port != wanted_port_) return;
    listener_->on_data(std::move(datagram));
}

void udp_filter::on_complete()
{
    listener_->on_complete();
}

void udp_filter::on_error(std::exception_ptr e)
{
    listener_->on_error(e);
}
