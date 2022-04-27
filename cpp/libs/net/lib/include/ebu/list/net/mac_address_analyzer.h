#pragma once

#include "../../../../../../rtp/lib/include/ebu/list/rtp/decoder.h"
#include "ebu/list/core/math/histogram_bucket.h"
#include "ebu/list/net/udp/listener.h"
#include "nlohmann/json.hpp"
#include <ebu/list/core/media/video_description.h>
#include <vector>

namespace ebu_list
{
    class mac_address_analyzer
    {
      public:
        struct mac_addresses_structure
        {
            std::string mac_address;
            int count;
        };

        struct mac_addresses_info
        {
            std::vector<mac_addresses_structure> repeated_mac_addresses = {};
        };

        mac_address_analyzer();
        ~mac_address_analyzer();

        mac_addresses_info get_mac_addresses_analysis() const;
        void on_data(const rtp::packet& packet);
        void on_complete();
        void on_error();

      private:
        mac_addresses_info info{};
    };
} // namespace ebu_list
