#include "utils.h"

using namespace ebu_list;
using namespace ebu_list::srt;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------

detector::status_description test::run_srt_format_detector(srt_format_detector& srt_d, udp_source& s)
{
    for(;;)
    {
        auto packet = s.next();
        if(!packet)
            return detector::status_description{/*.state*/ detector::state::invalid,
                                                /*.error_code*/ "UNIT_TESTING"};

        const auto result = srt_d.handle_data(std::move(packet.value()));
        if(result.state == detector::state::valid || result.state == detector::state::invalid) return result;
    }
}
