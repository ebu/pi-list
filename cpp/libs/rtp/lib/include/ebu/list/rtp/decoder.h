#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/rtp/header.h"
#include "ebu/list/net/udp/decoder.h"
#include <optional>

//------------------------------------------------------------------------------

namespace ebu_list::rtp
{
    class header_lens
    {
    public:
        header_lens(const raw_header&);

        int version() const noexcept;
        bool padding() const noexcept;
        bool extension() const noexcept;
        int csrc_count() const noexcept;
        bool marker() const noexcept;
        uint8_t payload_type() const noexcept;
        uint16_t sequence_number() const noexcept;
        uint32_t timestamp() const noexcept;
        uint32_t ssrc() const noexcept;

    private:
        const raw_header& header_;
    };

    using header = mapped_view<raw_header, header_lens>;
    using pdu = std::tuple<header, oview>;
    using maybe_pdu = std::optional<pdu>;

    maybe_pdu decode(oview&& raw_pdu);

    struct packet_info
    {
        packet_info(ethernet::header&& _ethernet_info,
                    udp::datagram_info&& _udp,
                    header&& _rtp);

        ethernet::header ethernet_info;
        udp::datagram_info udp;
        header rtp;
    };

    struct packet
    {
        packet_info info;
        oview sdu;
    };

    using maybe_packet = std::optional<packet>;

    maybe_packet decode(ethernet::header ethernet_info,
                        udp::datagram_info udp_info,
                        oview&& raw_pdu);
}
