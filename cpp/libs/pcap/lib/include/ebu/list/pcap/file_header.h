#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/types.h"

//------------------------------------------------------------------------------

namespace ebu_list::pcap
{
#pragma pack(push, 1)
    struct raw_file_header
    {
        std::array<byte, 4> magic_number; /* magic number */
        uint16_t version_major;           /* major version number */
        uint16_t version_minor;           /* minor version number */
        int32_t thiszone;                 /* GMT to local correction */
        uint32_t sigfigs;                 /* accuracy of timestamps */
        uint32_t snaplen;                 /* max length of captured packets, in octets */
        uint32_t network;                 /* data link type */
    };

    static_assert(sizeof(raw_file_header) == 24);
#pragma pack(pop)

    // from https://wiki.wireshark.org/Development/LibpcapFileFormat

    namespace version
    {
        constexpr uint32_t major = 0x02;
        constexpr uint32_t minor = 0x04;
    } // namespace version

    namespace magic_number
    {
        constexpr auto little_endian            = to_byte_array(0xd4, 0xc3, 0xb2, 0xa1);
        constexpr auto little_endian_nanosecond = to_byte_array(0x4d, 0x3c, 0xb2, 0xa1);
    } // namespace magic_number

    // TODO: we are assuming version 2.4, little-endian and thiszone = GMT,
    // as hinted by https://wiki.wireshark.org/Development/LibpcapFileFormat
    class file_header_lens
    {
      public:
        explicit file_header_lens(const raw_file_header& h) noexcept;

        // returns true if the magic number and version are acceptable
        bool is_valid() const noexcept;

        bool is_nanosecond() const noexcept;

      private:
        const raw_file_header& h_;
        bool is_valid_      = false;
        bool is_nanosecond_ = false;

        void parse_magic() noexcept;
        void parse_version() noexcept;
    };

    using file_header = mapped_view<raw_file_header, file_header_lens>;
} // namespace ebu_list::pcap
