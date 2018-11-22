#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/st2110/d40/header.h"
#include "ebu/list/core/memory/bimo.h"

//------------------------------------------------------------------------------

namespace ebu_list::st2110::d40
{
    class anc_packet_header_lens
    {
    public:
        explicit anc_packet_header_lens(const raw_anc_packet_header& raw_packet_header);

        uint8_t color_channel() const;
        uint16_t line_num() const;
        uint16_t horizontal_offset() const;
        uint8_t stream_num() const;
        uint8_t did() const;
        uint8_t sdid() const;
        uint8_t data_count() const;
        bool sanity_check() const;
        void dump() const;

    private:
        /* Raw header contains 10-fields including parity bits.
         * Use public accessors to get the effective field values. */
        const raw_anc_packet_header& raw_packet_header_;
    };

    using anc_packet_header = mapped_view<raw_anc_packet_header, anc_packet_header_lens>;

    class anc_header_lens
    {
    public:
        explicit anc_header_lens(const raw_anc_header& raw_header);

        uint16_t length() const;
        uint8_t anc_count() const;
        uint8_t field_identification() const;

    private:
        const raw_anc_header& raw_header_;
    };

    using anc_header = mapped_view<raw_anc_header, anc_header_lens>;
}
