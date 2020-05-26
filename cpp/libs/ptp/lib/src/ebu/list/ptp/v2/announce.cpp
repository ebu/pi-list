#include "ebu/list/ptp/v2/announce.h"

using namespace ebu_list::ptp::v2;
using namespace ebu_list::ptp;
using namespace ebu_list;

//------------------------------------------------------------------------------

announce_message_lens::announce_message_lens(const announce_body& h) noexcept : h_(h)
{
}

auto announce_message_lens::grandmaster_identity() const noexcept -> const std::array<uint8_t, 8>&
{
    return h_.grandmaster_identity;
}

std::string v2::to_string(const clock_id_t& id)
{
    return fmt::format("{:02X}-{:02X}-{:02X}-{:02X}-{:02X}-{:02X}-{:02X}-{:02X}", id[0], id[1], id[2], id[3], id[4],
                       id[5], id[6], id[7]);
}
