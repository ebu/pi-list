#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/rtp/decoder.h"

using namespace ebu_list;
using namespace ebu_list::rtp;

udp_handler::udp_handler(handler_creator creator)
    : creator_(std::move(creator))
{
}

void udp_handler::on_data(udp::datagram&& datagram)
{
    auto maybe_rtp_packet = rtp::decode(datagram.info, std::move(datagram.sdu));
    if (!maybe_rtp_packet)
    {
        logger()->trace("Non-RTP datagram from {} to {}", to_string(source(datagram.info)), to_string(destination(datagram.info)));
        return;
    }

    auto rtp_packet = std::move(maybe_rtp_packet.value());

    auto handler = find_or_create(rtp_packet);
    handler->on_data(std::move(rtp_packet));
}

void udp_handler::on_complete()
{
    for( auto& handler: handlers_)
    {
        handler.second->on_complete();
    }
}

void udp_handler::on_error(std::exception_ptr e)
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

rtp::listener* udp_handler::find_or_create(const rtp::packet& packet)
{
    logger()->trace("RTP datagram from {} to {}, SSRC: {:08x}", to_string(source(packet.info.udp)),
        to_string(destination(packet.info.udp)), packet.info.rtp.view().ssrc());

    const auto d = stream_descriptor
    {
        packet.info.rtp.view().ssrc(),
        source(packet.info.udp),
        destination(packet.info.udp)
    };

    auto it = handlers_.find(d);

    if (it == handlers_.end())
    {
        auto new_handler = creator_(packet);
        const auto p_handler = new_handler.get();
        handler_map::value_type v{ d, std::move(new_handler) };
        handlers_.insert(std::move(v));
        return p_handler;
    }

    return it->second.get();
}
