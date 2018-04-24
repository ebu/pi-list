#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/c_analyzer.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------
namespace
{
    constexpr fraction64 B{ 11, 10 };  // Drain factor as defined in SMPTE2110 - 21

    struct cinst_state
    {
        std::vector<int64_t> timediffs;
        std::vector<int> cinst;
        std::vector<int> cleared; // Amount of packets cleared out of the buffer
        std::optional<int64_t> initial_time;
        int64_t old_time = 0;
    };

    fraction64 calculate_t_drain_ns(fraction64 tframe, int64_t npackets)
    {
        const auto t1 = tframe / npackets;
        const auto t2_ns = t1 * 1'000'000'000;
        return t2_ns / B;
    }

    int update_cinst(cinst_state& state, int64_t packet_time_ns, fraction64 t_drain_ns)
    {
        if (!state.initial_time.has_value())
        {
            state.initial_time = packet_time_ns;
            // Initialize the cinst bucket with 1 packet
            const auto cinst = 0;

            state.cinst.push_back(cinst);
            state.cleared.push_back(0);

            state.old_time = packet_time_ns;
            return cinst;
        }

        assert(state.old_time != 0);

        const auto timediff = packet_time_ns - state.old_time;
        state.timediffs.push_back(timediff);

        const auto fclear_number = (packet_time_ns - state.initial_time.value()) / t_drain_ns;
        const auto clear_number = static_cast<int>(floor(fclear_number.to_float()));
        state.cleared.push_back(clear_number);
        const auto buffer = state.cinst.at(state.cinst.size() - 1) + 1 - (state.cleared.at(state.cleared.size() - 1) - state.cleared.at(state.cleared.size() - 2));

        const auto cinst = buffer >= 0 ? buffer : 0;
        state.cinst.push_back(cinst);

        state.old_time = packet_time_ns;
        return cinst;
    }
}

//------------------------------------------------------------------------------

class cinst_histogram
{
public:
    void on_data(int cinst);

    const cinst_histogram_t& values() const noexcept;

private:
    cinst_histogram_t values_;
};

void cinst_histogram::on_data(int cinst)
{
    auto it = values_.find(cinst);
    if (it == values_.end())
    {
        values_.insert({ cinst, 1 });
    }
    else
    {
        it->second = it->second + 1;
    }
}

const cinst_histogram_t& cinst_histogram::values() const noexcept
{
    return values_;
}

//------------------------------------------------------------------------------

struct c_analyzer::impl
{
    impl(listener_uptr l, int64_t npackets, media::video::Rate rate)
        : listener_(std::move(l)),
        npackets_(npackets),
        tframe_(1 / rate),
        t_drain_ns_(calculate_t_drain_ns(tframe_, npackets_))
    {
    }

    const listener_uptr listener_;
    const int64_t npackets_; // Number of packets per frame
    const fraction64 tframe_; // Period of a frame, in seconds
    const fraction64 t_drain_ns_; // Cinst time between draining two packets, in ns
    cinst_state cinst_state_;
    cinst_histogram histogram_;
};

//------------------------------------------------------------------------------

c_analyzer::c_analyzer(listener_uptr l, int64_t npackets, media::video::Rate rate)
    : impl_(std::make_unique<impl>(std::move(l), npackets, rate))
{
}

c_analyzer::~c_analyzer() = default;

void c_analyzer::on_data(const rtp::packet& p)
{
    const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(p.info.udp.packet_time.time_since_epoch()).count();
    const auto cinst = update_cinst(impl_->cinst_state_, packet_time_ns, impl_->t_drain_ns_);

    const auto marker_bit = p.info.rtp.view().marker();

    impl_->histogram_.on_data(cinst);
    impl_->listener_->on_data( { p.info.udp.packet_time, cinst, marker_bit, {} });
}

void c_analyzer::on_complete()
{
    impl_->listener_->on_data({ {}, {}, {}, impl_->histogram_.values() });
    impl_->listener_->on_complete();
}

void c_analyzer::on_error(std::exception_ptr)
{
}
