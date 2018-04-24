#pragma once

#include "ebu/list/core/types.h"
#include "ebu/list/st2110/d20/header.h"
#include "ebu/list/core/memory/bimo.h"

//------------------------------------------------------------------------------

namespace ebu_list::st2110::d20
{
    class line_header_lens
    {
    public:
        explicit line_header_lens(const raw_line_header& raw_header);

        uint16_t length() const;
        uint16_t line_number() const;
        uint8_t field_identification() const;
        bool continuation() const;
        uint16_t offset() const;

    private:
        const raw_line_header& raw_header_;
    };

    using line_header = mapped_view<raw_line_header, line_header_lens>;
}
