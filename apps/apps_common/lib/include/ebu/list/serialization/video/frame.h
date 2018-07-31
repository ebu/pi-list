#pragma once

#include "nlohmann/json.hpp"

namespace ebu_list
{
    struct frame_info
    {
        uint32_t timestamp = 0;
        size_t packet_count = 0;
        int64_t first_packet_timestamp = 0;
        int64_t last_packet_timestamp = 0;

        /** serialization details **/
        static nlohmann::json to_json(const frame_info& info);
        static frame_info from_json(const nlohmann::json& j);
    };

    struct line_info
    {
        bool valid = false;
        uint16_t length;
        uint16_t line_number;
        uint8_t field_identification;
        bool continuation;
        uint16_t offset;

        /** serialization details **/
        static nlohmann::json to_json(const line_info& line);
        static line_info from_json(const nlohmann::json& j);
    };
    using lines_info = std::array<line_info, 3>; // ST2110-20 6.2.1: max 3 line headers per packet

    nlohmann::json to_json(const lines_info& lines);
}