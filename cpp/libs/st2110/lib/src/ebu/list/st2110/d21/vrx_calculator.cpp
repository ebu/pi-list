#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/d21/vrx_calculator.h"

using namespace ebu_list;
using namespace ebu_list::st2110::d21;

//------------------------------------------------------------------------------

vrx_calculator::vrx_calculator(int npackets,
    media::video::info video_info,
    vrx_settings settings)
    : settings_(settings),
    tframe_(1 / video_info.rate),
    constants_(calculate_vrx_constants(npackets, tframe_, settings.schedule, video_info.scan, video_info.raster)),
	trs_ns_(to_double(constants_.trs))
{
}

void vrx_calculator::on_frame_start(const fraction64& packet_time)
{
	current_n_ = calculate_n(packet_time, tframe_);

	if(settings_.tvd == tvd_kind::ideal)
	{
		const auto base_frame_time = current_n_ * tframe_;
		const auto ideal_tvd = base_frame_time + constants_.tr_offset;

		if(settings_.troffset.has_value())
		{
			tvd_ = base_frame_time + fraction64(settings_.troffset.value().count(), 1'000'000'000);
		}
		else
		{
			tvd_ = ideal_tvd;
		}
	}
	else
	{
		LIST_ASSERT(settings_.tvd == tvd_kind::first_packet_first_frame);

		if(!first_tvd_)
		{
			first_tvd_ = packet_time;
		}

		tvd_ = first_tvd_.value() + tframe_ * frame_count_;
	}

	drained_prev_ = 0;
	vrx_prev_ = 0;

	++frame_count_;
}

packet_info vrx_calculator::on_packet(const clock::time_point& packet_timestamp, bool frame_start)
{
    const auto packet_time_ns = std::chrono::duration_cast<std::chrono::nanoseconds>(packet_timestamp.time_since_epoch()).count();
    const auto packet_time = fraction64(packet_time_ns, std::giga::num);

    auto current = packet_info{ packet_timestamp };

    if (frame_start)
    {
		on_frame_start(packet_time);
		current.delta_to_ideal_tpr0 = tvd_ - packet_time;
	}

    // TODO: should we continue to drain packets after Tvd + Npackets * Trs?
    // TODO: should we disallow Vrx underflow?

	const auto packet_delta_ns = to_double(packet_time - tvd_);
	const auto drained = static_cast<int>((packet_delta_ns + trs_ns_) / trs_ns_);

    current.vrx = vrx_prev_ + 1 - (drained - drained_prev_);
    vrx_prev_ = current.vrx;
    drained_prev_ = drained;

    return current;
}
