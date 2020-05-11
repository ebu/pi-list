#include "ebu/list/analysis/handlers/anc_stream_handler.h"
#include "ebu/list/analysis/handlers/anc_payload_decoder.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/math/histogram.h"
#include "ebu/list/net/multicast_address_analyzer.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/st2110/d40/packet.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110::d40;

//------------------------------------------------------------------------------

namespace
{
    constexpr uint32_t rtp_seqnum_window = 2048;
    static struct klvanc_callbacks_s klvanc_callbacks;
} // namespace

struct anc_stream_handler::impl
{
    impl(listener_uptr l, histogram_listener_uptr h_l) : listener_(std::move(l)), histogram_listener_(std::move(h_l)) {}

    void on_data(const frame_info& frame_info)
    {
        listener_->on_data(frame_info);
        histogram_.add_value(frame_info.packets_per_frame);
    }

    void on_complete()
    {
        histogram_listener_->on_data(histogram_.values());
        histogram_listener_->on_complete();
        listener_->on_complete();
    }

    const listener_uptr listener_;
    const histogram_listener_uptr histogram_listener_;
    histogram<int> histogram_;
};

anc_stream_handler::anc_stream_handler(rtp::packet first_packet, listener_uptr l_rtp, histogram_listener_uptr l_h,
                                       serializable_stream_info info, anc_stream_details details, completion_handler ch)
    : impl_(
          std::make_unique<impl>(std::move(l_rtp), l_h ? std::move(l_h) : std::make_unique<null_histogram_listener>())),
      info_(std::move(info)), anc_description_(std::move(details)), completion_handler_(std::move(ch))
{
    logger()->info("Ancillary: created handler for {:08x}, {}->{}", info_.network.ssrc, to_string(info_.network.source),
                   to_string(info_.network.destination));

    info_.state = stream_state::ON_GOING_ANALYSIS;

    anc_description_.first_packet_ts = first_packet.info.udp.packet_time;
    anc_description_.last_frame_ts   = first_packet.info.rtp.view().timestamp();

    info_.network.valid_multicast_mac_address =
        is_multicast_address(first_packet.info.ethernet_info.destination_address);

    info_.network.valid_multicast_ip_address = is_multicast_address(first_packet.info.udp.destination_address);

    info_.network.multicast_address_match = is_same_multicast_address(
        first_packet.info.ethernet_info.destination_address, first_packet.info.udp.destination_address);

    info_.state      = stream_state::ON_GOING_ANALYSIS; // mark as analysis started
    const auto& anc  = this->info();
    nlohmann::json j = anc_stream_details::to_json(anc);
    logger()->trace("Stream info:\n {}", j.dump(2, ' '));

    if(klvanc_context_create(&klvanc_ctx) < 0)
    {
        logger()->error("Ancillary: error initializing libklvanc library context");
    }
#ifdef LIBVANC_DEBUG
    klvanc_ctx->verbose = 1;
#endif
    klvanc_ctx->callbacks       = &klvanc_callbacks;
    klvanc_callbacks.smpte_12_2 = cb_smpte_12_2;
    klvanc_callbacks.eia_708b   = cb_eia_708;
    klvanc_callbacks.afd        = cb_afd;
    klvanc_callbacks.scte_104   = cb_scte_104;
}

anc_stream_handler::~anc_stream_handler(void)
{
    klvanc_context_destroy(klvanc_ctx);
}

const anc_stream_details& anc_stream_handler::info() const
{
    return anc_description_;
}

const serializable_stream_info& anc_stream_handler::network_info() const
{
    return info_;
}

void anc_stream_handler::on_data(const rtp::packet& packet)
{
    ++anc_description_.packet_count;
    anc_description_.last_packet_ts = packet.info.udp.packet_time;
    const auto marked               = packet.info.rtp().marker();

    packets_per_frame_.on_packet(packet.info.rtp.view());
    parse_packet(packet);

    logger()->trace("Ancillary packet={}, frame={}, marker={}", anc_description_.packet_count,
                    anc_description_.frame_count, (marked) ? "1" : "0");
    if(anc_description_.anc.scan_type == video::scan_type::INTERLACED)
    {
        logger()->trace("Ancillary field: last={}, cur={}", last_field_, field_);
    }

    /* frame transition based on RTP TS change */
    const auto timestamp = packet.info.rtp.view().timestamp();
    if(timestamp != anc_description_.last_frame_ts)
    {
        if(anc_description_.last_frame_ts)
        {
            const auto delta  = modulo_difference(timestamp, anc_description_.last_frame_ts);
            anc_description_.rtp_ts_delta = rtp::to_ticks32(delta);
        }

        anc_description_.last_frame_ts = timestamp;
        anc_description_.frame_count++;

        const auto packet_time_ns =
            std::chrono::duration_cast<std::chrono::nanoseconds>(packet.info.udp.packet_time.time_since_epoch())
                .count();
        const auto packet_time      = fraction64(packet_time_ns, std::giga::num);
        const auto rtp_timestamp    = packet.info.rtp.view().timestamp();
        const auto tframe           = fraction64(1, anc_description_.anc.rate);
        first_rtp_to_packet_deltas_ = calculate_rtp_to_packet_deltas(tframe, rtp_timestamp, packet_time);

        /* a good transition means a marker bit in the last packet and
         * field transition if interlaced */
        if(!last_frame_was_marked_)
        {
            logger()->debug("Ancillary: missing marker bit");
            anc_description_.wrong_marker_count++;
        }
        if((anc_description_.anc.scan_type == video::scan_type::INTERLACED) && (last_field_ == field_) &&
           (last_field_ != static_cast<uint8_t>(field_kind::undefined)))
        {
            logger()->debug("Ancillary: missing field bit transition");
            anc_description_.wrong_field_count++;
        }
    }
    else
    {
        if(last_frame_was_marked_)
        {
            logger()->debug("Ancillary: wrong marker bit in frame");
            anc_description_.wrong_marker_count++;
        }
        if((anc_description_.anc.scan_type == video::scan_type::INTERLACED) && (last_field_ != field_) &&
           (last_field_ != static_cast<uint8_t>(field_kind::undefined)))
        {
            logger()->debug("Ancillary: wrong field bit transition in frame");
            anc_description_.wrong_field_count++;
        }
    }

    /* report variable pkts/frame on every marker bit after a complete
     * frame was received */
    if(marked)
    {
        if(anc_description_.frame_count > 1)
        {
            impl_->on_data(
                {packet.info.udp.packet_time, packets_per_frame_.count().value_or(0), first_rtp_to_packet_deltas_, anc_description_.rtp_ts_delta});
            packets_per_frame_.reset();
            packets_per_frame_.on_packet(packet.info.rtp.view());
        }
    }

    last_frame_was_marked_ = marked;
    last_field_            = field_;
}

void anc_stream_handler::on_complete()
{
    if(rtp_seqnum_analyzer_.num_dropped_packets() > 0)
    {
        anc_description_.dropped_packet_count += rtp_seqnum_analyzer_.num_dropped_packets();
        anc_description_.dropped_packet_samples = rtp_seqnum_analyzer_.dropped_packets();
        logger()->info("ancillary rtp packet drop: {}", anc_description_.dropped_packet_count);
    }

    auto anc_sub_streams = anc_description_.anc.sub_streams;
    for(auto it = anc_sub_streams.begin(); it != anc_sub_streams.end(); it++)
    {
        anc_description_.payload_error_count += it->errors();
    }

    impl_->on_complete();
    this->on_stream_complete();
    info_.network.dscp = dscp_.get_info();
    info_.state        = stream_state::ANALYZED;
    completion_handler_(*this);
}

void anc_stream_handler::on_error(std::exception_ptr e)
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

void anc_stream_handler::parse_packet(const rtp::packet& packet)
{
    auto& sdu = packet.sdu;

    auto p                              = sdu.view().data();
    const auto end                      = sdu.view().data() + sdu.view().size();
    const auto extended_sequence_number = to_native(reinterpret_cast<const raw_extended_sequence_number*>(p)->esn);
    const uint32_t full_sequence_number = (extended_sequence_number << 16) | packet.info.rtp.view().sequence_number();
    p += sizeof(raw_extended_sequence_number);

    rtp_seqnum_analyzer_.handle_packet(full_sequence_number, packet.info.udp.packet_time);
    dscp_.handle_packet(packet);

    const auto anc_header = anc_header_lens(*reinterpret_cast<const raw_anc_header*>(p));
    p += sizeof(raw_anc_header);

    field_ = anc_header.field_identification();
    switch(field_)
    {
    case static_cast<uint8_t>(field_kind::invalid): anc_description_.wrong_field_count++; break;
    case static_cast<uint8_t>(field_kind::progressive):
        if(anc_description_.anc.scan_type == video::scan_type::INTERLACED)
        {
            anc_description_.wrong_field_count++;
        }
        break;
    case static_cast<uint8_t>(field_kind::interlaced_first_field):
        if(anc_description_.anc.scan_type == video::scan_type::PROGRESSIVE)
        {
            anc_description_.wrong_field_count++;
        }
        break;
    case static_cast<uint8_t>(field_kind::interlaced_second_field):
        if(anc_description_.anc.scan_type == video::scan_type::PROGRESSIVE)
        {
            anc_description_.wrong_field_count++;
        }
        break;
    }

    /*
     * for every embedded sub-stream in the packet:
     * - get the header
     * - discard the whole rtp stream if the header doesn't match ancillary
     * - walk through the payload+checksum+padding
     * - verify the parity for every word and checksum
     * - increment an error counter for every stream
     * - return if error detected but do not invalidate because the
     *   capture may still contains valid other sub-streams
     */
    for(uint8_t i = 0; i < anc_header.anc_count(); i++)
    {
        if(p > end)
        {
            /* could be truncated */
            logger()->warn("Ancillary: stream shorter than expected");
            return;
        }

        uint16_t bit_counter = 0;
        raw_anc_packet_header anc_packet_header;
        anc_packet_header.color_channel     = get_bits<1>(&p, &bit_counter);
        anc_packet_header.line_num          = get_bits<11>(&p, &bit_counter);
        anc_packet_header.horizontal_offset = get_bits<12>(&p, &bit_counter);
        anc_packet_header.stream_flag       = get_bits<1>(&p, &bit_counter);
        anc_packet_header.stream_num        = get_bits<7>(&p, &bit_counter);
        anc_packet_header.did               = get_bits<10>(&p, &bit_counter);
        anc_packet_header.sdid              = get_bits<10>(&p, &bit_counter);
        anc_packet_header.data_count        = get_bits<10>(&p, &bit_counter);

        /* checksum and libklvanc uses the 9-bit UDW so raw header is used here
         */
        uint16_t sum                  = anc_packet_header.did + anc_packet_header.sdid + anc_packet_header.data_count;
        std::vector<uint16_t> udw_buf = {0x0000, 0x03ff, 0x03ff}; // Ancillary Data Flag in SDI world is
                                                                  // required by libklvanc
        udw_buf.push_back(anc_packet_header.did);
        udw_buf.push_back(anc_packet_header.sdid);
        udw_buf.push_back(anc_packet_header.data_count);

        const auto anc_packet = anc_packet_header_lens(anc_packet_header);
        auto s                = anc_sub_stream(anc_packet);
        /* is this sub-stream already registered? */
        auto it = std::find(anc_description_.anc.sub_streams.begin(), anc_description_.anc.sub_streams.end(), s);
        if(it == anc_description_.anc.sub_streams.end())
        {
            logger()->info("Ancillary: new sub-stream: {}: {}", to_string(s.did_sdid()), to_description(s.did_sdid()));
            anc_description_.anc.sub_streams.push_back(s);
            it = std::find(anc_description_.anc.sub_streams.begin(), anc_description_.anc.sub_streams.end(), s);
        }

        uint16_t errors = it->errors();
        ++it->packet_count;
        if(!s.is_valid())
        {
            logger()->warn("Ancillary: sub-stream invalid");
            errors++;
        }

        /* walkthrough the UDW payload */
        for(uint8_t j = 0; j < anc_packet.data_count(); j++)
        {
            const uint16_t udw = get_bits<10>(&p, &bit_counter);
            udw_buf.push_back(udw);
            if(!sanity_check_word(udw))
            {
                errors++;
            }
            sum += udw;
        }

        const uint16_t crc = get_bits<10>(&p, &bit_counter);
        udw_buf.push_back(crc);
        if(!sanity_check_sum(crc, sum))
        {
            errors++;
        }
        it->errors(errors);

        klvanc_ctx->callback_context = &(*it);
        if(klvanc_packet_parse(klvanc_ctx, anc_packet.line_num(), static_cast<uint16_t*>(udw_buf.data()),
                               udw_buf.size()) < 0)
        {
            logger()->error("libklvanc: failed to parse ancillary");
        }

        /* skip the padding */
        while(bit_counter % 32)
        {
            get_bits<1>(&p, &bit_counter);
        }
    }
}
