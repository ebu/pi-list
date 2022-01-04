#include "ebu/list/analysis/handlers/ttml_stream_handler.h"
#include "ebu/list/analysis/handlers/dscp_analyzer.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/math/histogram.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/rtp/sequence_number_analyzer.h"
#include "ebu/list/st2110/d40/packet.h"
#include "ebu/list/ttml/ttml_description.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::analysis::ttml;

//------------------------------------------------------------------------------

namespace
{
    constexpr uint32_t rtp_seqnum_window = 2048;
}

struct ebu_list::analysis::ttml::stream_handler::impl
{
    impl(ebu_list::rtp::packet first_packet, listener_uptr l, serializable_stream_info info,
         ttml::stream_details details, completion_handler ch)
        : listener_(std::move(l)), info_(std::move(info)), ttml_description_(std::move(details)),
          completion_handler_(std::move(ch))
    {
        logger()->info("TTML: created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                       to_string(info_.network.destination));

        info_.state = stream_state::ON_GOING_ANALYSIS;

        ttml_description_.first_packet_ts = first_packet.info.udp.packet_time;

        info_.network.valid_multicast_mac_address =
            is_multicast_address(first_packet.info.ethernet_info.destination_address);

        info_.network.valid_multicast_ip_address = is_multicast_address(first_packet.info.udp.destination_address);

        info_.network.multicast_address_match = is_same_multicast_address(
            first_packet.info.ethernet_info.destination_address, first_packet.info.udp.destination_address);

        info_.network.has_extended_header = first_packet.info.rtp.view().extension();

        info_.network.dscp = info.network.dscp;
        nlohmann::json j   = stream_details::to_json(ttml_description_);
        logger()->trace("Stream info:\n {}", j.dump(2, ' '));
    }

    void on_complete() { listener_->on_complete(); }

    void parse_packet(const ebu_list::rtp::packet& packet)
    {
        if(packet.info.rtp.view().extension())
        {
            info_.network.has_extended_header = true;
        }

        auto& sdu                 = packet.sdu;
        auto ptr                  = sdu.view().data();
        const auto payload_header = ebu_list::ttml::header(*reinterpret_cast<const ebu_list::ttml::nbo_header*>(ptr));
        ptr += sizeof(ebu_list::ttml::nbo_header);

        if(payload_header.length > sdu.view().length())
        {
            logger()->error("Packet length is smaller than the announced payload length");
        }

        const auto end = ptr + payload_header.length;

        current_doc_.insert(current_doc_.end(), ptr, end);
    }

    const listener_uptr listener_;
    ebu_list::analysis::serializable_stream_info info_;
    stream_details ttml_description_;
    completion_handler completion_handler_;
    std::vector<std::byte> current_doc_;
};

ebu_list::analysis::ttml::stream_handler::stream_handler(ebu_list::rtp::packet first_packet, listener_uptr l_rtp,
                                                         serializable_stream_info info, ttml::stream_details details,
                                                         completion_handler ch)
    : impl_(std::make_unique<impl>(std::move(first_packet), std::move(l_rtp), std::move(info), std::move(details),
                                   std::move(ch)))
{
}

stream_handler::~stream_handler() = default;

const ebu_list::analysis::ttml::stream_details& ebu_list::analysis::ttml::stream_handler::info() const
{
    return impl_->ttml_description_;
}

const ebu_list::analysis::serializable_stream_info& ebu_list::analysis::ttml::stream_handler::network_info() const
{
    return impl_->info_;
}

void ebu_list::analysis::ttml::stream_handler::on_data(const ebu_list::rtp::packet& packet)
{
    impl_->ttml_description_.last_packet_ts = packet.info.udp.packet_time;
    const auto marked                       = packet.info.rtp().marker();

    impl_->parse_packet(packet);

    if(marked)
    {
        std::string s(reinterpret_cast<const char*>(impl_->current_doc_.data()), impl_->current_doc_.size());
        impl_->listener_->on_data(packet.info.rtp.view().timestamp(), s);
        impl_->current_doc_.clear();
    }
}

void ebu_list::analysis::ttml::stream_handler::on_complete()
{
    impl_->on_complete();
    impl_->info_.state = stream_state::ANALYZED;
    impl_->completion_handler_(*this);
}

void ebu_list::analysis::ttml::stream_handler::on_error(std::exception_ptr e)
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
