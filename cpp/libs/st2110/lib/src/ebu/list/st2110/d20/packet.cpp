#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d20/packet.h"

using namespace ebu_list::st2110::d20;

//////////////////////////////////////////////////////////////////////

line_header_lens::line_header_lens(const raw_line_header& raw_header)
    : raw_header_(raw_header)
{
}

uint16_t line_header_lens::length() const
{
    return to_native(raw_header_.length);
}

uint16_t line_header_lens::line_number() const
{
    return (raw_header_.line_no_1 << 8) | raw_header_.line_no_0;
}

uint8_t line_header_lens::field_identification() const
{
    return raw_header_.field_identification;
}

bool line_header_lens::continuation() const
{
    return raw_header_.continuation != 0;
}

uint16_t line_header_lens::offset() const
{
    return (raw_header_.offset_1 << 8) | raw_header_.offset_0;
}
