#pragma once

#include "ebu/list/st2110/d20/video_description.h"
#include "ebu/list/st2110/d21/compliance.h"
#include "nlohmann/json.hpp"

namespace ebu_list::st2110::d21
{
    struct cinst_analysis
    {
        compliance_profile compliance;
        std::map<int, float> histogram;
        int cmax_wide;
        int cmax_narrow;
    };

    struct vrx_analysis
    {
        compliance_profile compliance;
        std::map<int, float> histogram;
        int vrx_full_wide;
        int vrx_full_narrow;
    };

    struct trs_analysis
    {
        double trs_ns;
    };

    struct video_analysis_info
    {
        compliance_profile compliance;
        cinst_analysis cinst;
        vrx_analysis vrx;
        trs_analysis trs;
    };

    compliance_analyzer build_compliance_analyzer(const st2110::d20::video_description& video, vrx_settings settings);
    video_analysis_info get_video_analysis_info(const compliance_analyzer& ca);

    void to_json(nlohmann::json& j, const compliance_profile& v);
    void from_json(const nlohmann::json& j, compliance_profile& v);
    void to_json(nlohmann::json& j, const video_analysis_info& v);
    void from_json(const nlohmann::json& j, video_analysis_info& v);
    void to_json(nlohmann::json& j, const cinst_analysis& v);
    void from_json(const nlohmann::json& j, cinst_analysis& v);
    void to_json(nlohmann::json& j, const vrx_analysis& v);
    void from_json(const nlohmann::json& j, vrx_analysis& v);
    void to_json(nlohmann::json& j, const trs_analysis& v);
    void from_json(const nlohmann::json& j, trs_analysis& v);
} // namespace ebu_list::st2110::d21
