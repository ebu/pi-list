#include "ebu/list/srt/srt_format_detector.h"
#include "ebu/list/srt/header.h"

using namespace ebu_list::srt;
using namespace ebu_list::st2110;

detector::status_description srt_format_detector::handle_data(const udp::datagram& datagram)
{
    auto& sdu = datagram.sdu;
    // Verify packet payload header to see if matches payload header of srt packet
    if(static_cast<size_t>(sdu.view().size()) < sizeof(uint32_t))
    {
        // logger()->error("Packet size smaller than minimum: {}", sdu.view().size());
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_SRT_INVALID_PAYLOAD_SIZE"};
    }
    auto payload_header = header(sdu);
    auto packet_type    = payload_header.get_packet_type_flag();
    if(packet_type != 0)
    {
        return detector::status_description{/*.state*/ detector::state::detecting,
                                            /*.error_code*/ "STATUS_CODE_FORMAT_DETECTING"};
    }

    auto order_flag = payload_header.get_order_flag();
    if(order_flag != 0)
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_SRT_INVALID_ORDER_FLAG"};
    }

    auto destination_socket_id = payload_header.get_destination_socket_id();
    if(!destination_socket_id_.has_value())
    {
        destination_socket_id_ = destination_socket_id;
    }
    else if(destination_socket_id != destination_socket_id_)
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_SRT_INVALID_DESTINATION_SOCKET_ID"};
    }

    auto timestamp = payload_header.get_timestamp();
    if(!timestamp_.has_value())
    {
        timestamp_ = destination_socket_id;
    }
    else if(timestamp == timestamp_)
    {
        return detector::status_description{/*.state*/ detector::state::invalid,
                                            /*.error_code*/ "STATUS_CODE_SRT_INVALID_TIMESTAMP"};
    }

    return detector::status_description{/*.state*/ detector::state::valid,
                                        /*.error_code*/ "STATUS_CODE_SRT_VALID"};
}