#include "ebu/list/st2110/format_detector.h"
#include "ebu/list/st2110/d20/video_format_detector.h"
#include "ebu/list/st2110/d30/audio_format_detector.h"
#include "ebu/list/st2110/d40/anc_format_detector.h"
#include "ebu/list/st2110/pch.h"

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
    if (status_description_.state != detector::state::detecting) return;

    std::vector<const detector*> to_remove;
    const detector* one_valid = nullptr;

    for (auto& d : detectors_)
    {
        const auto result = d->handle_data(packet);
        if (result.state == detector::state::invalid)
        {
            // logger()->debug("Detector marked this stream as not target
            // format");
            const auto kind = d->get_kind();
            error_codes_list_[kind].push_back(result.error_code);
            to_remove.push_back(d.get());
        }

        if (result.state == detector::state::valid)
        {
            status_description_ = result;
            one_valid = d.get();
        }
    }

    if (one_valid)
    {
        detectors_.erase(
            remove_if(begin(detectors_), end(detectors_),
                      [&](const auto& x) { return x.get() != one_valid; }),
            end(detectors_));
    }
    else
    {
        detectors_.erase(remove_if(begin(detectors_), end(detectors_),
                                   [&](const auto& x) {
                                       return find(begin(to_remove),
                                                   end(to_remove),
                                                   x.get()) != end(to_remove);
                                   }),
                         end(detectors_));
    }

    if (detectors_.empty())
    {
        status_description_.state = detector::state::invalid;
        status_description_.error_code =
            "STATUS_CODE_FORMAT_NO_DETECTORS_FOUND";
    }
}

void format_detector::on_complete() {}

void format_detector::on_error(std::exception_ptr) {}

detector::status_description format_detector::status() const noexcept
{
    return status_description_;
}

detector::details format_detector::get_details() const
{
    if (status_description_.state != detector::state::valid)
        return std::nullopt;

    assert(detectors_.size() == 1);
    return detectors_[0]->get_details();
}

const std::map<std::string, std::vector<std::string>>&
format_detector::get_error_codes() const
{
    return error_codes_list_;
}
