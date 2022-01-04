#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/rtp/decoder.h"

using namespace ebu_list;
using namespace ebu_list::rtp;

///////////////////////////////////////////////////////////////////////////////

udp_handler::udp_handler(handler_creator creator) : creator_(std::move(creator))
{
}

void udp_handler::on_data(const udp::datagram& datagram)
{
    auto handler = find_or_create(datagram);

    if(handler)
    {
        handler->on_data(datagram);
    }
}

void udp_handler::on_complete()
{
    for(auto& handler : handlers_)
    {
        if(handler.second)
        {
            handler.second->on_complete();
        }
    }
}

void udp_handler::on_error(std::exception_ptr e)
{
    try
    {
        std::rethrow_exception(e);
    }
    catch(std::exception& ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}

udp::listener* udp_handler::find_or_create(const udp::datagram& datagram)
{
    const auto s = source(datagram.info);
    const auto d = destination(datagram.info);

    const stream_key key = {s, d};

    auto it = handlers_.find(key);

    if(it == handlers_.end())
    {
        auto new_handler     = creator_(datagram);
        const auto p_handler = new_handler.get();
        handlers_.emplace(key, std::move(new_handler));
        return p_handler;
    }

    return it->second.get();
}
