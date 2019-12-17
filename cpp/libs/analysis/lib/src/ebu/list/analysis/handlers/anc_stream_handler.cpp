#include "ebu/list/analysis/handlers/anc_stream_handler.h"
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

    // TODO: replace this global variable by a proper alternative
    static struct klvanc_callbacks_s klvanc_callbacks;
} // namespace

// #define LIBVANC_DEBUG

static int cb_smpte_12_2(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
                         struct klvanc_packet_smpte_12_2_s* pkt)
{
#ifdef LIBVANC_DEBUG
    if(klvanc_dump_SMPTE_12_2(ctx, pkt) != 0)
    {
        logger()->error("Ancillary: error dumping SMPTE 12-2 packet!\n");
        return -1;
    }
#endif

    if(pkt->dbb1 > 2)
    {
        logger()->warn("Ancillary: unknown timecode type: {}", pkt->dbb1);
        return -1;
    }

    auto s                   = static_cast<anc_sub_stream*>(callback_context);
    const std::string DBB1[] = {"ATC LTC", "ATC VITC1", "ATC VITC2"};
    std::string timecode =
        fmt::format("{:02d}:{:02d}:{:02d}:{:02d}\n", pkt->hours, pkt->minutes, pkt->seconds, pkt->frames);

    /* DBB1 is used as a UID */
    auto ss = anc_sub_sub_stream(DBB1[pkt->dbb1]);
    /* is this sub sub stream already registered? */
    auto it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    if(it == s->anc_sub_sub_streams.end())
    {
        logger()->info("Ancillary: new sub-sub-stream timecode ({})", DBB1[pkt->dbb1]);
        s->anc_sub_sub_streams.push_back(ss);
        it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    }
    it->decoded_data += timecode;

    return 0;
}

static const char* cc_type_lookup(int cc_type)
{
    switch(cc_type)
    {
    case 0x00: return "NTSC line 21 field 1 CC";
    case 0x01: return "NTSC line 21 field 2 CC";
    case 0x02: return "DTVCC Channel Packet Data";
    case 0x03: return "DTVCC Channel Packet Start";
    default: return "Unknown";
    }
}

static const char* cc_framerate_lookup(int frate)
{
    switch(frate)
    {
    case 0x00: return "Forbidden";
    case 0x01: return "23.976";
    case 0x02: return "24";
    case 0x03: return "25";
    case 0x04: return "29.97";
    case 0x05: return "30";
    case 0x06: return "50";
    case 0x07: return "59.94";
    case 0x08: return "60";
    default: return "Reserved";
    }
}

std::string cc_608_decode(uint8_t* cc)
{
    /* remove parity bits */
    uint8_t cc1 = cc[0] & 0x7F;
    uint8_t cc2 = cc[1] & 0x7F;

    /* two basic characters, one special character, or one extended character */
    if(!cc1 && !cc2) // padding
        return "";
    else if(cc1 & 0b01100000) // ASCII-ish char
        return fmt::format("{}{}", static_cast<char>(cc1), static_cast<char>(cc2));
    else if((cc2 == 0x2C) || (cc2 == 0x2D)) // end or carriage return
        return "\n";
    else // other control command
        return "?";
}

static int cb_eia_708(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
                      struct klvanc_packet_eia_708b_s* pkt)
{
    auto s  = static_cast<anc_sub_stream*>(callback_context);
    auto ss = anc_sub_sub_stream("Details");

    auto it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    if(it == s->anc_sub_sub_streams.end())
    {
        logger()->info("Ancillary: new sub-sub-stream: CEA 708 details");
        s->anc_sub_sub_streams.push_back(ss);
        it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    }

    it->decoded_data += fmt::format("-----------------------------------\n\
header:\n\
    cdp:\n\
        identifier = 0x{:04x} ({})\n\
        length = {}\n\
        framerate = 0x{:02x} ({} FPS)\n\
",
                                    pkt->header.cdp_identifier,
                                    pkt->header.cdp_identifier == 0x9669 ? "VALID" : "INVALID", pkt->header.cdp_length,
                                    pkt->header.cdp_frame_rate, cc_framerate_lookup(pkt->header.cdp_frame_rate));

    it->decoded_data +=
        fmt::format("\
    present:\n\
        timecode = {}\n\
        close caption = {}\n\
        service info: {}\n\
",
                    pkt->header.time_code_present, pkt->header.ccdata_present, pkt->header.svcinfo_present);

    if(pkt->header.svcinfo_present)
    {
        it->decoded_data += fmt::format("\
service info:\n\
    id = 0x{:02x} ({})\n\
    start = {}\n\
    change = {}\n\
    complete = {}\n\
    count = {}\n\
",
                                        pkt->ccsvc.ccsvcinfo_id, pkt->ccsvc.ccsvcinfo_id == 0x73 ? "VALID" : "INVALID",
                                        pkt->header.svc_info_start, pkt->header.svc_info_change,
                                        pkt->header.svc_info_complete, pkt->ccsvc.svc_count);

        for(int i = 0; i < pkt->ccsvc.svc_count; i++)
        {
            it->decoded_data += fmt::format("\
        {}\n\
            service data: {}\n\
",
                                            pkt->ccsvc.svc[i].caption_service_number, pkt->ccsvc.svc[i].svc_data_byte);
        }
    }

    it->decoded_data += fmt::format("\
    caption service active = {}\n\
    sequence counter = {}\n\
",
                                    pkt->header.caption_service_active, pkt->header.cdp_hdr_sequence_cntr);

    if(pkt->header.ccdata_present)
    {
        it->decoded_data += fmt::format("\
close caption data:\n\
    id = 0x{:02x} ({})\n\
    count = {}\n\
",
                                        pkt->ccdata.ccdata_id, pkt->ccdata.ccdata_id == 0x72 ? "VALID" : "INVALID",
                                        pkt->ccdata.cc_count);

        /*
        for (int i = 0; i < pkt->ccdata.cc_count; i++) {
            it->decoded_data += fmt::format("\
        {}\n\
            valid = 0x{:02x}\n\
            type = 0x{:02x} ({})\n\
            data 1 = 0x{:02x}\n\
            data 2 = 0x{:02x}\n\
",
            i,
            pkt->ccdata.cc[i].cc_valid,
            pkt->ccdata.cc[i].cc_type,
            cc_type_lookup(pkt->ccdata.cc[i].cc_type),
            pkt->ccdata.cc[i].cc_data[0],
            pkt->ccdata.cc[i].cc_data[1]);
        }
        */
    }

    it->decoded_data += fmt::format("\
footer:\n\
    id = 0x{:02x} ({})\n\
    sequence counter = 0x{:02x} ({})\n\
    checksum = 0x{:02x} ({})\n\
\n",
                                    pkt->footer.cdp_footer_id, pkt->footer.cdp_footer_id == 0x74 ? "VALID" : "INVALID",
                                    pkt->footer.cdp_ftr_sequence_cntr,
                                    pkt->footer.cdp_ftr_sequence_cntr == pkt->header.cdp_hdr_sequence_cntr
                                        ? "Matches Header"
                                        : "INVALID: does not match header",
                                    pkt->footer.packet_checksum, pkt->checksum_valid == 1 ? "VALID" : "INVALID");

    /* Save individuals CC tracks */
    if(pkt->header.ccdata_present)
    {
        for(int i = 0; i < pkt->ccdata.cc_count; i++)
        {
            ss = anc_sub_sub_stream(cc_type_lookup(pkt->ccdata.cc[i].cc_type));

            it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
            if(it == s->anc_sub_sub_streams.end())
            {
                logger()->info("Ancillary: new sub-sub-stream: EIA 608 track ({})",
                               cc_type_lookup(pkt->ccdata.cc[i].cc_type));
                s->anc_sub_sub_streams.push_back(ss);
                it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
            }
            it->decoded_data += cc_608_decode(pkt->ccdata.cc[i].cc_data);
        }
    }

#ifdef LIBVANC_DEBUG
    if(klvanc_dump_EIA_708B(ctx, pkt) != 0)
    {
        logger()->error("Ancillary: error dumping EIA-708 packet!\n");
        return -1;
    }
#endif

    return 0;
}

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

    info_.state = StreamState::ON_GOING_ANALYSIS;

    anc_description_.first_packet_ts = first_packet.info.udp.packet_time;
    anc_description_.last_frame_ts   = first_packet.info.rtp.view().timestamp();

    info_.network.valid_multicast_mac_address =
        is_multicast_address(first_packet.info.ethernet_info.destination_address);

    info_.network.valid_multicast_ip_address = is_multicast_address(first_packet.info.udp.destination_address);

    info_.network.multicast_address_match = is_same_multicast_address(
        first_packet.info.ethernet_info.destination_address, first_packet.info.udp.destination_address);

    info_.state      = StreamState::ON_GOING_ANALYSIS; // mark as analysis started
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

    logger()->trace("Ancillary packet={}, frame={}, marker={}", anc_description_.packet_count,
                    anc_description_.frame_count, (marked) ? "1" : "0");

    packets_per_frame_.on_packet(packet.info.rtp.view());

    const auto timestamp = packet.info.rtp.view().timestamp();
    /* frame transition based on RTP TS change */
    if(timestamp != anc_description_.last_frame_ts)
    {
        anc_description_.last_frame_ts = timestamp;
        anc_description_.frame_count++;

        const auto packet_time_ns =
            std::chrono::duration_cast<std::chrono::nanoseconds>(packet.info.udp.packet_time.time_since_epoch())
                .count();
        const auto packet_time      = fraction64(packet_time_ns, std::giga::num);
        const auto rtp_timestamp    = packet.info.rtp.view().timestamp();
        const auto tframe           = fraction64(1, anc_description_.anc.rate);
        first_rtp_to_packet_deltas_ = calculate_rtp_to_packet_deltas(tframe, rtp_timestamp, packet_time);

        if(!last_frame_was_marked_)
        {
            logger()->debug("Ancillary: missing marker bit");
            anc_description_.wrong_marker_count++;
        }
    }
    else if(last_frame_was_marked_)
    {
        logger()->debug("Ancillary: wrong marker bit in frame");
        anc_description_.wrong_marker_count++;
    }

    /* report variable pkts/frame on every marker bit after a complete
     * frame was received */
    if(marked)
    {
        if(anc_description_.frame_count > 1)
        {
            impl_->on_data(
                {packet.info.udp.packet_time, packets_per_frame_.count().value_or(0), first_rtp_to_packet_deltas_});
            packets_per_frame_.reset();
            packets_per_frame_.on_packet(packet.info.rtp.view());
        }
    }

    last_frame_was_marked_ = marked;

    parse_packet(packet);
}

void anc_stream_handler::on_complete()
{
    if(rtp_seqnum_analyzer_.dropped_packets() > 0)
    {
        anc_description_.dropped_packet_count += rtp_seqnum_analyzer_.dropped_packets();
        logger()->info("ancillary rtp packet drop: {}", anc_description_.dropped_packet_count);
    }

    impl_->on_complete();
    this->on_stream_complete();
    info_.state = StreamState::ANALYZED;
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

    rtp_seqnum_analyzer_.handle_packet(full_sequence_number);

    const auto anc_header = anc_header_lens(*reinterpret_cast<const raw_anc_header*>(p));
    p += sizeof(raw_anc_header);

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

        /* is it acceptable data? */
        const auto anc_packet = anc_packet_header_lens(anc_packet_header);
        auto s                = anc_sub_stream(anc_packet);
        if(!s.is_valid())
        {
            logger()->warn("Ancillary: sub-stream invalid");
            continue;
        }

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
