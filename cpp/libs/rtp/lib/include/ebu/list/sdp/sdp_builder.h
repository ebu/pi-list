#pragma once

#include "ebu/list/sdp/media_description.h"
#include <string>
#include <vector>

namespace ebu_list::sdp
{
    struct sdp_global_settings
    {
        std::string session_name;
        std::string session_info;
    };

    class sdp_builder
    {
      public:
        explicit sdp_builder(const sdp_global_settings& settings);

        [[nodiscard]] const std::vector<std::string>& sdp() const;

        sdp_builder& add_media(const media::network_media_description& media_description);

        template <class T> sdp_builder& add_media(const media::network_media_description& media_description, T writer)
        {
            this->add_media(media_description);

            writer.write_rtpmap_line(lines_, media_description);
            writer.additional_attributes(lines_, media_description);

            return *this;
        }

      private:
        void write_media_line(const media::network_media_description& media_description);

        void write_connection_line(const media::network_media_description& media_description);

        void write_media_clock_lines();

      private:
        std::vector<std::string> lines_;
    };

    void write_to(const sdp_builder& sdp, const path& path);
} // namespace ebu_list::sdp
