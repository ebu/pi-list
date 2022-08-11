#include "catch2/catch.hpp"
#include "ebu/list/core/types.h"
#include "ebu/list/srt/header.h"

using namespace ebu_list;
using namespace ebu_list::srt;

//------------------------------------------------------------------------------
SCENARIO("srt data packet header")
{
    GIVEN("a buffer with 16 bytes")
    {
        const auto buffer = to_byte_array(0xFF, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        // byte buffer[4] = {byte(0), byte(0), byte(0), byte(0x4B)};

        WHEN("we check the fields of the first line in payload header")
        {
            auto payload_header = header(buffer);

            auto packet_type_flag = payload_header.get_packet_type_flag();
            auto sequence_number  = payload_header.get_packet_sequence_number();

            THEN("packet type flag must be 1")
            {
                REQUIRE(packet_type_flag == 0x01);
            }
            THEN("sequence number must be 0xFE000000")
            {
                REQUIRE(sequence_number == 0x7F000000);
            }
        }
    }

    GIVEN("a buffer with 16 bytes")
    {
        const auto buffer = to_byte_array(0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

        WHEN("we check the fields of the second line in payload header")
        {
            auto payload_header = header(buffer);

            auto packet_position_flag = payload_header.get_packet_position_flag();
            auto order_flag           = payload_header.get_order_flag();
            auto encryption_flag      = payload_header.get_encryption_flag();
            auto retransmission_flag  = payload_header.get_retransmission_flag();
            auto message_number       = payload_header.get_message_number();

            THEN("packet position flag must be 11")
            {
                REQUIRE(packet_position_flag == 0x03);
            }
            THEN("order flag must be 1")
            {
                REQUIRE(order_flag == 0x01);
            }
            THEN("encryption flag must be 11")
            {
                REQUIRE(encryption_flag == 0x03);
            }
            THEN("retransmission flag must be 1")
            {
                REQUIRE(retransmission_flag == 0x01);
            }
            THEN("message number must be 0x03FF0000")
            {
                REQUIRE(message_number == 0x03FF0000);
            }
        }
    }

    GIVEN("a buffer with 16 bytes")
    {
        const auto buffer = to_byte_array(0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0xFF, 0xFF, 0, 0xFF, 0xFF);

        WHEN("we check the fields of the third and fourth line in payload header")
        {
            auto payload_header = header(buffer);

            auto timestamp             = payload_header.get_timestamp();
            auto destination_socket_id = payload_header.get_destination_socket_id();

            THEN("timestamp counter must be 0xFFFF00FF")
            {
                REQUIRE(timestamp == 0xFFFF00FF);
            }
            THEN("destination socket id must be 0xFF00FFFF")
            {
                REQUIRE(destination_socket_id == 0xFF00FFFF);
            }
        }
    }

    GIVEN("a buffer with 16 bytes")
    {
        const auto buffer = to_byte_array(0, 0, 0, 0x69, 0xC0, 0, 0, 0x69, 0xFF, 0xFF, 0, 0xFF, 0xFF, 0, 0xFF, 0xFF);

        WHEN("we check the fields of the payload header")
        {
            auto payload_header = header(buffer);

            auto packet_type_flag = payload_header.get_packet_type_flag();
            auto sequence_number  = payload_header.get_packet_sequence_number();

            auto packet_position_flag = payload_header.get_packet_position_flag();
            auto order_flag           = payload_header.get_order_flag();
            auto encryption_flag      = payload_header.get_encryption_flag();
            auto retransmission_flag  = payload_header.get_retransmission_flag();
            auto message_number       = payload_header.get_message_number();

            auto timestamp             = payload_header.get_timestamp();
            auto destination_socket_id = payload_header.get_destination_socket_id();

            THEN("packet type flag must be 0")
            {
                REQUIRE(packet_type_flag == 0);
            }
            THEN("sequence number must be 105")
            {
                REQUIRE(sequence_number == 0x00000069);
            }

            THEN("packet position flag must be 11")
            {
                REQUIRE(packet_position_flag == 0x03);
            }
            THEN("order flag must be 0")
            {
                REQUIRE(order_flag == 0);
            }
            THEN("encryption flag must be 00")
            {
                REQUIRE(encryption_flag == 0);
            }
            THEN("retransmission flag must be 0")
            {
                REQUIRE(retransmission_flag == 0);
            }
            THEN("message number must be 105")
            {
                REQUIRE(message_number == 0x00000069);
            }

            THEN("timestamp counter must be 0xFFFF00FF")
            {
                REQUIRE(timestamp == 0xFFFF00FF);
            }
            THEN("destination socket id must be 0xFF00FFFF")
            {
                REQUIRE(destination_socket_id == 0xFF00FFFF);
            }
        }
    }
}