#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/c_analyzer.h"
#include "ebu/list/core/math/histogram.h"
#include "ebu/list/st2110/d21/c_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

using cinst_histogram = histogram<int>;

//------------------------------------------------------------------------------

struct c_analyzer::impl
{
    impl(listener_uptr l, int64_t npackets, media::video::Rate rate)
        : listener_(std::move(l)),
        calculator_(npackets, rate)
    {
    }

    const listener_uptr listener_;
    cinst_histogram histogram_;
    c_calculator calculator_;
};

//------------------------------------------------------------------------------

c_analyzer::c_analyzer(listener_uptr l, int64_t npackets, media::video::Rate rate)
    : impl_(std::make_unique<impl>(std::move(l), npackets, rate))
{
}

c_analyzer::~c_analyzer() = default;

void c_analyzer::on_data(const rtp::packet& p)
{
    const auto cinst = impl_->calculator_.on_packet(p.info.udp.packet_time);

    impl_->histogram_.add_value(cinst);

    const auto marker_bit = p.info.rtp.view().marker();
    impl_->listener_->on_data( { p.info.udp.packet_time, cinst, marker_bit, impl_->histogram_.values() });
}

void c_analyzer::on_complete()
{
    impl_->listener_->on_data({ {}, {}, {}, impl_->histogram_.values() });
    impl_->listener_->on_complete();
}

void c_analyzer::on_error(std::exception_ptr)
{
}
