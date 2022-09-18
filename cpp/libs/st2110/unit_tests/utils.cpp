#include "utils.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------

detector::status_description test::run_detector(detector& d, rtp_source& s)
{
    for(;;)
    {
        auto packet = s.next();
        if(!packet)
        {
            return detector::status_description{/*.state*/ detector::state::invalid,
                                                /*.error_code*/ "UNIT_TESTING"};
        }
        const auto result = d.handle_data(packet.value());
        if(result.state == detector::state::valid || result.state == detector::state::invalid)
        {
            return result;
        }
    }
}
