#include "ebu/list/core/media/video_description.h"
#include <cassert>
#include <regex>
#include <stdexcept>
#include <string>

using namespace ebu_list;
using namespace ebu_list::media;
using namespace ebu_list::media::video;

std::string video::to_string(scan_type scan)
{
    switch(scan)
    {
    case scan_type::INTERLACED: return "interlaced";
    default: assert(scan == scan_type::PROGRESSIVE); return "progressive";
    }
}

scan_type video::parse_scan_type(std::string_view s)
{
    if(s == "interlaced")
        return scan_type::INTERLACED;
    else if(s == "progressive")
        return scan_type::PROGRESSIVE;
    else
        throw std::runtime_error("Invalid Scan Type");
}

Rate video::parse_from_string(std::string_view s)
{
    if(s == "0")
        return video::Rate(0);
    else if(s == "24000/1001")
        return video::Rate(24000, 1001);
    else if(s == "24")
        return video::Rate(24, 1);
    else if(s == "25")
        return video::Rate(25, 1);
    else if(s == "30000/1001")
        return video::Rate(30000, 1001);
    else if(s == "30")
        return video::Rate(30, 1);
    else if(s == "50")
        return video::Rate(50, 1);
    else if(s == "60000/1001")
        return video::Rate(60000, 1001);
    else if(s == "60")
        return video::Rate(60, 1);
    else
    {
        static const std::regex fraction_regex("^(\\d+)(\\/(\\d+))?$");

        std::cmatch fraction_match;
        const auto matches_fraction = std::regex_match(s.begin(), s.end(), fraction_match, fraction_regex);
        LIST_ENFORCE(matches_fraction, std::runtime_error, "Unknown rate: {}", s);

        assert(fraction_match.size() >= 4);
        assert(fraction_match[1].matched);

        if(fraction_match[3].matched)
        {
            // It is a fraction
            const std::string d{fraction_match[1].first, fraction_match[1].second};
            const std::string n{fraction_match[3].first, fraction_match[3].second};
            auto den = std::stoi(d);
            auto num = std::stoi(n);
            return video::Rate(den, num);
        }

        // It is a single number
        const std::string n{fraction_match[1].first, fraction_match[0].second};
        auto rate = std::stoi(n);
        return video::Rate(rate, 1);
    }
}
