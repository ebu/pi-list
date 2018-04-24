#include <utility>
#include "ebu/list/ptp/udp_filter.h"

using namespace ebu_list;
using namespace ebu_list::ptp;

udp_filter::udp_filter(message_listener_ptr ptp_listener, udp::listener_ptr non_ptp_listener)
    : ptp_listener_(std::move(ptp_listener)),
    non_ptp_listener_(std::move(non_ptp_listener))
{
}

void udp_filter::on_data(udp::datagram&& datagram)
{
    if (ptp::may_be_ptp(datagram.info.destination_address, datagram.info.destination_port))
    {
        auto maybe_ptp = ptp::decode(datagram.info.packet_time, std::move(datagram.sdu));
        if (maybe_ptp)
        {
            ptp_listener_->on_data(std::move(maybe_ptp.value()));
            return;
        }
    }
    else
    {
        non_ptp_listener_->on_data(std::move(datagram));
    }
}

void udp_filter::on_complete()
{
    ptp_listener_->on_complete();
    non_ptp_listener_->on_complete();
}

void udp_filter::on_error(std::exception_ptr e)
{
    ptp_listener_->on_error(e);
    non_ptp_listener_->on_error(e);
}
