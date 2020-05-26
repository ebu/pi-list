#include "ebu/list/ptp/v2/message_header.h"

using namespace ebu_list::ptp::v2;
using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------

message_header_lens::message_header_lens(const message_header& h) noexcept : h_(h)
{
}

message_type message_header_lens::type() const noexcept
{
    return static_cast<message_type>(h_.message_type);
}

uint16_t message_header_lens::sequence_id() const noexcept
{
    return to_native(h_.sequence_id);
}

const clock_id_t& message_header_lens::clock_identity() const noexcept
{
    return h_.clock_identity;
}

uint8_t message_header_lens::subdomain_number() const noexcept
{
    return h_.subdomain_number;
}

//------------------------------------------------------------------------------
header::header(mapped_oview<message_header>&& common_header)
    : common_header_(std::move(common_header)), header_lens_(common_header_.value())
{
}

const message_header_lens& header::value() const noexcept
{
    return header_lens_;
}

//------------------------------------------------------------------------------

std::tuple<header, oview> v2::take_header(oview&& pdu)
{
    auto [common_header_data, sdu] = split(std::move(pdu), sizeof(v2::message_header));
    mapped_oview<v2::message_header> common_header(std::move(common_header_data));
    v2::header header(std::move(common_header));

    return {header, sdu};
}
