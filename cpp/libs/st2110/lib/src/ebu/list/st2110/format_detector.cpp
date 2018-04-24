#include "ebu/list/st2110/pch.h"
#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/st2110/d20/video_format_detector.h"
#include "ebu/list/st2110/d30/audio_format_detector.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

//////////////////////////////////////////////////////////////////////

format_detector::format_detector(rtp::packet /*first_packet*/)
{
    detectors_.push_back(std::make_unique<d20::video_format_detector>());
    detectors_.push_back(std::make_unique<d30::audio_format_detector>());
    detectors_.push_back(std::make_unique<d40::anc_format_detector>());
}

void format_detector::on_data(const rtp::packet& packet)
{
    if (status_ != detector::status::detecting) return;

    std::vector<const detector*> to_remove;

    for(auto& d : detectors_) 
    { 
        const auto result = d->handle_data(packet);
        if (result == detector::status::invalid)
        {
            logger()->debug("Detector marked this stream as not target format");

            to_remove.push_back(d.get());
        }

        if (result == detector::status::valid && detectors_.size() == 1)
        {
            status_ = detector::status::valid;
        }
    }

    detectors_.erase(remove_if(begin(detectors_), end(detectors_),
        [&](const auto& x) { return find(begin(to_remove), end(to_remove), x.get()) != end(to_remove); }), 
        end(detectors_));

    if (detectors_.empty())
    {
        status_ = detector::status::invalid;
    }
}

void format_detector::on_complete()
{
}

void format_detector::on_error(std::exception_ptr)
{
}

detector::status format_detector::status() const noexcept
{
    return status_;
}

detector::details format_detector::get_details() const
{
    if (status_ != detector::status::valid) return std::nullopt;

    assert(detectors_.size() == 1);
    return detectors_[0]->get_details();
}
