#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/vrx_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------
template<typename T>
constexpr double to_double(const fraction_t<T>& f) noexcept
{
	return f.numerator() / static_cast<double>(f.denominator());
}

//------------------------------------------------------------------------------

vrx_calculator::vrx_calculator(int npackets,
    media::video::info video_info,
    vrx_settings settings)
    : settings_(settings),
    tframe_(1 / video_info.rate),
    constants_(calculate_vrx_constants(npackets, tframe_, settings.schedule, video_info.scan, video_info.raster))
{
}

packet_info vrx_calculator::on_packet(const clock::time_point& packet_timestamp, bool frame_start)
{
    const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(packet_timestamp.time_since_epoch()).count();
    const auto packet_time = fraction64(packet_time_ns, std::giga::num);

    auto current = packet_info{ packet_timestamp };

    if (frame_start)
    {
        current_n_ = calculate_n(packet_time, tframe_);

        const auto base_frame_time = current_n_ * tframe_;
        const auto ideal_tvd = base_frame_time + constants_.tr_offset;

        if (settings_.tvd == tvd_kind::ideal)
        {
            if (settings_.troffset.has_value())
            {
                tvd_ = base_frame_time + fraction64(settings_.troffset.value().count(), 1'000'000'000);
            }
            else
            {
                tvd_ = ideal_tvd;
            }
        }
        else if (settings_.tvd == tvd_kind::first_packet_first_frame)
        {
            if (!first_tvd_)
            {
                first_tvd_ = packet_time;
            }

            tvd_ = first_tvd_.value() + tframe_ * frame_count_;
        }
        else
        {
            LIST_ASSERT(settings_.tvd == tvd_kind::first_packet_each_frame);
            tvd_ = packet_time;
        }

        drained_prev_ = 0;
        
        // TODO: do not reset
        vrx_prev_ = 0;

        current.delta_to_ideal_tpr0 = tvd_ - packet_time;

        ++frame_count_;
    }

    // TODO: should we continue to drain packets after Tvd + Npackets * Trs?
    // TODO: should we disallow Vrx underflow?

	const auto pt = to_double(packet_time);
	const auto tvd_p = to_double(tvd_);
	const auto trs_p = to_double(constants_.trs);
	const auto drained = static_cast<int>((pt - tvd_p + trs_p) / trs_p);

    //const auto drained = static_cast<int>(floor((packet_time - tvd_ + constants_.trs) / constants_.trs));
    current.vrx = vrx_prev_ + 1 - (drained - drained_prev_);

	if(current.vrx > 1000)
	{
		logger()->info("Ping");
	}

    vrx_prev_ = current.vrx;

    drained_prev_ = drained;

    return current;
}
