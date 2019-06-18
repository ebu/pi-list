#pragma once

#include <string>
#include <vector>
#include "ebu/list/sdp/media_description.h"

namespace ebu_list::sdp
{
    struct sdp_global_settings
    {
        std::string session_name;
        std::string session_info;
        ebu_list::path path;
    };

    class sdp_writer
    {
    public:

        explicit sdp_writer(const sdp_global_settings& settings);

        std::vector<std::string> sdp() const;
        void write(void) const;

        sdp_writer& add_media(const ebu_list::media::network_media_description& media_description);

        template< class T>
        sdp_writer& add_media(const ebu_list::media::network_media_description& media_description, T writer)
        {
            this->add_media(media_description);

            writer.write_rtpmap_line(lines_, media_description);
            writer.additional_attributes(lines_, media_description);

            return *this;
        }

    private:
        void write_media_line(const ebu_list::media::network_media_description& media_description);
        void write_connection_line(const ebu_list::media::network_media_description& media_description);
        void write_media_clock_lines();

    private:
        ebu_list::path path_;
        std::vector<std::string> lines_;
    };
}
