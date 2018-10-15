#include "ebu/list/core/media/anc_description.h"
#include "ebu/list/st2110/d40/anc_description.h"

using namespace ebu_list::st2110::d40;
using namespace ebu_list::media;
namespace ancillary = ebu_list::media::anc;

anc_stream::anc_stream(uint8_t did, uint8_t sdid, uint8_t num)
    : did_sdid_(static_cast<ancillary::did_sdid>((did << 8) + sdid))
    , num_(num)
{
    check();
}

anc_stream::anc_stream(uint16_t did_sdid, uint8_t num)
    : did_sdid_(static_cast<ancillary::did_sdid>(did_sdid))
    , num_(num)
{
    check();
}

void anc_stream::check()
{
    for(auto &it : ancillary::stream_types)
    {
        if(it.second == did_sdid_){
            return;
        }
    }
    did_sdid_ = ancillary::did_sdid::UNKNOWN;
}

bool anc_stream::operator==(const anc_stream& other)
{
    return ((other.did_sdid() == this->did_sdid()) && (other.num() == this->num()));
}

ancillary::did_sdid anc_stream::did_sdid() const
{
    return did_sdid_;
}

uint8_t anc_stream::num() const
{
    return num_;
}

bool anc_stream::is_valid() const
{
    return (did_sdid_ != ancillary::did_sdid::UNKNOWN);
}
