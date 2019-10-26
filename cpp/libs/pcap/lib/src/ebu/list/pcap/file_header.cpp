#include "ebu/list/pcap/file_header.h"
#include "ebu/list/core/idioms.h"
#include "ebu/list/core/memory/bimo.h"

using namespace ebu_list::pcap;
using namespace ebu_list;

//------------------------------------------------------------------------------
file_header_lens::file_header_lens(const raw_file_header& h) noexcept : h_(h)
{
    parse_magic();
    if (!is_valid_) return;
    parse_version();
}

void file_header_lens::parse_magic() noexcept
{
    if (h_.magic_number == magic_number::little_endian)
    {
        is_valid_      = true;
        is_nanosecond_ = false;
    }
    else if (h_.magic_number == magic_number::little_endian_nanosecond)
    {
        is_valid_      = true;
        is_nanosecond_ = true;
    }
    else
    {
        // TODO: this could only mean that the byte ordering is swapped. Do we want to implement big endian?
        is_valid_ = false;
    }
}

void file_header_lens::parse_version() noexcept
{
    if (h_.version_major != version::major)
    {
        is_valid_ = false;
        return;
    }

    if (h_.version_minor != version::minor)
    {
        is_valid_ = false;
        return;
    }
}

bool file_header_lens::is_valid() const noexcept
{
    return is_valid_;
}

bool file_header_lens::is_nanosecond() const noexcept
{
    return is_nanosecond_;
}
