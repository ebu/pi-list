#include "ebu/list/analysis/serialization/jxsv_stream_serializer.h"
#include "ebu/list/analysis/constants.h"
#include "ebu/list/analysis/serialization/compliance.h"
#include "ebu/list/analysis/serialization/utils.h"
#include "ebu/list/analysis/serialization/video/st2110_d20_packet.h"
#include "ebu/list/analysis/utils/color_conversion.h"
#include "ebu/list/analysis/utils/png_writer.h"

using namespace ebu_list;
using namespace ebu_list::analysis;
using namespace ebu_list::st2110;
using json = nlohmann::json;

//------------------------------------------------------------------------------

jxsv_stream_serializer::jxsv_stream_serializer(rtp::packet first_packet, serializable_stream_info info,
                                               video_stream_details details, completion_callback on_complete_callback)
    : jpeg_xs_stream_handler(
          std::move(first_packet), info, details,
          [this, on_complete_callback](const jpeg_xs_stream_handler&) { on_complete_callback(*this); }),
      compliance_(
          d21::build_compliance_analyzer(details.video, {details.video.schedule, d21::tvd_kind::ideal, std::nullopt}, d21::vrx_analysis_mode_t::disabled))
{
}

void jxsv_stream_serializer::on_frame_started(const frame_jpeg_xs& /*f*/)
{
}

void jxsv_stream_serializer::on_packet(const packet_jpeg_xs_info& p)
{
    mac_analyzer_.on_data(p.packet);
    compliance_.handle_packet(p.packet.info);
}

void jxsv_stream_serializer::on_frame_complete(frame_jpeg_xs_uptr&& /*f*/)
{
}

st2110::d21::video_analysis_info jxsv_stream_serializer::get_video_analysis_info() const
{
    return st2110::d21::get_video_analysis_info(compliance_);
}

mac_address_analyzer::mac_addresses_info jxsv_stream_serializer::get_mac_adresses_analyses() const
{
    return mac_analyzer_.get_mac_addresses_analysis();
}
