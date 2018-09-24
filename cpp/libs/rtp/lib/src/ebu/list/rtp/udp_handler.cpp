#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/rtp/decoder.h"

using namespace ebu_list;
using namespace ebu_list::rtp;

///////////////////////////////////////////////////////////////////////////////
namespace
{
class rtp_analyzer : public rtp::listener
{
  public:
    explicit rtp_analyzer(const rtp::packet &first_packet, rtp::listener_uptr next);

    void on_data(const packet &p) override;
    void on_complete() override;
    void on_error(std::exception_ptr) override;

  private:
    uint16_t last_sequence_number_;
    rtp::listener_uptr next_;
};

rtp_analyzer::rtp_analyzer(const rtp::packet &first_packet, rtp::listener_uptr next)
    : last_sequence_number_(first_packet.info.rtp.view().sequence_number() - 1),
    next_(std::move(next))
{
}

void rtp_analyzer::on_data(const packet &p)
{
    const auto sn = p.info.rtp.view().sequence_number();

    ++last_sequence_number_;
    if (sn != last_sequence_number_)
    {
        // fmt::print("Dropped - expected: {:x} actual: {:x}\n", last_sequence_number_, sn);
        last_sequence_number_ = sn;
    }

    next_->on_data(p);
}

void rtp_analyzer::on_complete() 
{
    next_->on_complete();
}

void rtp_analyzer::on_error(std::exception_ptr e) 
{
        next_->on_error(e);
}
} // namespace

///////////////////////////////////////////////////////////////////////////////

udp_handler::udp_handler(handler_creator creator)
    : creator_(std::move(creator))
{
}

void udp_handler::on_data(udp::datagram &&datagram)
{
    auto maybe_rtp_packet = rtp::decode(datagram.info, std::move(datagram.sdu));
    if (!maybe_rtp_packet)
    {
        // logger()->trace("Non-RTP datagram from {} to {}", to_string(source(datagram.info)), to_string(destination(datagram.info)));
        return;
    }

    auto rtp_packet = std::move(maybe_rtp_packet.value());

    // logger()->trace("RTP datagram from {} to {}, SSRC: {:08x}", to_string(source(rtp_packet.info.udp)),
    //                to_string(destination(rtp_packet.info.udp)), rtp_packet.info.rtp.view().ssrc());

    auto handler = find_or_create(rtp_packet);
    handler->on_data(std::move(rtp_packet));
}

void udp_handler::on_complete()
{
    for (auto &handler : handlers_)
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
    catch (std::exception &ex)
    {
        logger()->info("on_error: {}", ex.what());
    }
}

rtp::listener *udp_handler::find_or_create(const rtp::packet &packet)
{
    const auto d = destination(packet.info.udp);

    auto it = handlers_.find(d);

    if (it == handlers_.end())
    {

        auto new_handler = creator_(packet);

// #define LIST_USE_ANALYZER
#if defined LIST_USE_ANALYZER
        new_handler = std::make_unique<rtp_analyzer>(packet, std::move(new_handler));
#endif // defined LIST_USE_ANALYZER

        const auto p_handler = new_handler.get();
        handlers_.emplace(d, std::move(new_handler));
        return p_handler;
    }

    return it->second.get();
}
