#include "ebu/list/analysis/handlers/troffset_calculator.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/core/platform/parallel.h"
// #include "ebu/list/database.h"
#include "ebu/list/analysis/utils/rtp_utils.h"
#include "ebu/list/pcap/player.h"
#include "ebu/list/rtp/udp_handler.h"
#include "ebu/list/st2110/d21/settings.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using json = nlohmann::json;

//------------------------------------------------------------------------------

namespace
{
    // TODO: move this to a common location
    int64_t to_ns(fraction64 t)
    {
        return static_cast<uint64_t>(round(static_cast<double>(t) * 1'000'000'000));
    }
} // namespace

//------------------------------------------------------------------------------

class troffset_analyzer : public udp::listener
{
  public:
    troffset_analyzer(std::string stream_id, media::video::info video_info, tro_map& tro_info);

    void on_data(const udp::datagram& datagram) override;

    void on_complete() override;

    void on_error(std::exception_ptr) override {}

  private:
    const std::string stream_id_;
    tro_map& tro_info_;
    const fraction64 t_frame_;
    const fraction64 tro_default_;
    std::optional<uint16_t> next_start_of_frame_;
    std::vector<int64_t> tros_;
};

troffset_analyzer::troffset_analyzer(std::string stream_id, media::video::info video_info, tro_map& tro_info)
    : stream_id_(stream_id), tro_info_(tro_info), t_frame_(1 / video_info.rate),
      tro_default_(st2110::d21::get_tro_default(1 / video_info.rate, video_info.scan, video_info.raster))
{
}

void troffset_analyzer::on_data(const udp::datagram& datagram)
{
    auto maybe_rtp_packet = rtp::decode(datagram.ethernet_info, datagram.info, std::move(datagram.sdu));
    if(!maybe_rtp_packet)
    {
        return;
    }

    auto p = std::move(maybe_rtp_packet.value());

    const auto sequence_number = p.info.rtp.view().sequence_number();

    if(p.info.rtp.view().marker())
    {
        const int current    = sequence_number;
        const auto next      = (current + 1) % 0x10000;
        next_start_of_frame_ = static_cast<uint16_t>(next);

        return;
    }

    if(next_start_of_frame_ && next_start_of_frame_.value() == sequence_number)
    {
        const auto packet_timestamp = p.info.udp.packet_time;
        const auto packet_time_ns =
            std::chrono::duration_cast<std::chrono::nanoseconds>(packet_timestamp.time_since_epoch()).count();
        const auto packet_time = fraction64(packet_time_ns, std::giga::num);

        const auto current_n          = calculate_n(packet_time, t_frame_);
        const auto base_frame_time    = current_n * t_frame_;
        const auto base_frame_time_ns = to_ns(base_frame_time);
        // Since current_n is derived from packet time, this must hold true
        assert(packet_time_ns >= base_frame_time_ns);
        const auto tro_ns = packet_time_ns - base_frame_time_ns;
        tros_.push_back(tro_ns);

        // const auto tro_ns = packet_time_ns - base_frame_time_ns;
        // logger()->info("tro_ns: {}\t{}\t{}\n", tro_ns, to_ns(tro_default_),
        // tro_ns - to_ns(tro_default_));

        next_start_of_frame_ = std::nullopt;
    }
}

void troffset_analyzer::on_complete()
{
    if(tros_.empty())
    {
        tro_info_.insert({stream_id_, tro_stream_info{to_ns(tro_default_), 0, 0, 0}});
    }
    else
    {
        const auto total_ns = std::accumulate(tros_.begin(), tros_.end(), int64_t{0});
        const int64_t avg   = total_ns / tros_.size();

        const auto max_el    = std::max_element(tros_.begin(), tros_.end());
        const auto max_value = max_el == tros_.end() ? 0 : *max_el;

        const auto min_el    = std::min_element(tros_.begin(), tros_.end());
        const auto min_value = min_el == tros_.end() ? 0 : *min_el;

        tro_info_.insert({stream_id_, tro_stream_info{to_ns(tro_default_), avg, max_value, min_value}});
    }
}

//------------------------------------------------------------------------------

tro_map analysis::calculate_average_troffset(ebu_list::path pcap_file,
                                             std::map<std::string, stream_with_details> wanted_streams)
{
    tro_map tro_info;

    auto create_handler = [&](const udp::datagram& first_datagram) -> udp::listener_uptr {
        auto maybe_rtp_packet = rtp::decode(first_datagram.ethernet_info, first_datagram.info, first_datagram.sdu);
        if(!maybe_rtp_packet)
        {
            return std::make_unique<udp::null_listener>();
        }

        auto first_packet = std::move(maybe_rtp_packet.value());

        const auto ssrc                  = first_packet.info.rtp.view().ssrc();
        const ipv4::endpoint destination = {first_datagram.info.destination_address,
                                            first_datagram.info.destination_port};

        const auto stream_info_it = std::find_if(wanted_streams.begin(), wanted_streams.end(), [&](const auto& info) {
            const stream_with_details& details = info.second;
            const auto& s                      = details.first;
            return s.network.ssrc == ssrc && s.network.destination == destination;
        });

        if(stream_info_it == wanted_streams.end())
        {
            return std::make_unique<udp::null_listener>();
        }

        const auto& stream_info = stream_info_it->second.first;

        if(stream_info.full_type == media::full_media_type::RAW)
        {
            const auto& in_video_info = std::get<video_stream_details>(stream_info_it->second.second);
            const auto video_info     = media::video::info{in_video_info.video.rate, in_video_info.video.scan_type,
                                                       in_video_info.video.dimensions};

            auto handler = std::make_unique<troffset_analyzer>(stream_info.id, video_info, tro_info);

            return handler;
        }
        else
        {
            return std::make_unique<udp::null_listener>();
        }
    };

    auto handler           = std::make_shared<rtp::udp_handler>(create_handler);
    auto progress_callback = [](float) {};
    auto player            = std::make_unique<pcap::pcap_player>(pcap_file, progress_callback, handler, on_error_exit);

    auto launcher = launch(std::move(player));

    launcher.wait();

    return tro_info;
}
