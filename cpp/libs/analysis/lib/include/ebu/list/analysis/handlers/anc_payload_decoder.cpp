/*
 * Copyright (C) 2020 European Broadcasting Union - Technology & Innovation
 * Copyright (C) 2020 CBC / Radio-Canada
 */

#include "ebu/list/analysis/handlers/anc_payload_decoder.h"
#include "ebu/list/st2110/d40/anc_description.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d40;

// #define LIBVANC_DEBUG

int cb_smpte_12_2(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
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

const char* cc_type_lookup(int cc_type)
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

const char* cc_framerate_lookup(int frate)
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

int cb_eia_708(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
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

int cb_afd(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
                         struct klvanc_packet_afd_s* pkt)
{
#ifdef LIBVANC_DEBUG
    if(klvanc_dump_AFD(ctx, pkt) != 0)
    {
        logger()->error("Ancillary: error dumping AFD!\n");
        return -1;
    }
#endif

    auto s  = static_cast<anc_sub_stream*>(callback_context);
    auto ss = anc_sub_sub_stream("Details");

    auto it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    if(it == s->anc_sub_sub_streams.end())
    {
        logger()->info("Ancillary: new sub-sub-stream: AFD details");
        s->anc_sub_sub_streams.push_back(ss);
        it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    }

    it->decoded_data += fmt::format("AFD: {} ({}) Aspect Ratio: {} Bar Flags: {} (0x{:02x})\n",
            klvanc_afd_to_string(pkt->afd),
            pkt->afd,
            klvanc_aspectRatio_to_string(pkt->aspectRatio),
            klvanc_barFlags_to_string(pkt->barDataFlags),
            pkt->barDataFlags);

    return 0;
}

/* SCTE 104
 * TODO: we got opID (OK) but also
 * "parse_SCTE_104() Unsupported opID = 3, error."
 * So this callback does the minimum for now, records the opID.
 * */
int cb_scte_104(void* callback_context, [[maybe_unused]] struct klvanc_context_s* ctx,
                     struct klvanc_packet_scte_104_s* pkt)
{
#ifdef LIBVANC_DEBUG
    if(klvanc_dump_SCTE_104(ctx, pkt) != 0)
    {
        logger()->error("Ancillary: error dumping SCTE 104!\n");
        return -1;
    }
#endif

    auto s  = static_cast<anc_sub_stream*>(callback_context);
    auto ss = anc_sub_sub_stream("Details");

    auto it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    if(it == s->anc_sub_sub_streams.end())
    {
        logger()->info("Ancillary: new sub-sub-stream: SCTE 104 details");
        s->anc_sub_sub_streams.push_back(ss);
        it = std::find(s->anc_sub_sub_streams.begin(), s->anc_sub_sub_streams.end(), ss);
    }

    it->decoded_data += fmt::format("{} operation detected\n", pkt->so_msg.opID == SO_INIT_REQUEST_DATA ? "single" : "multiple");

    return 0;
}
