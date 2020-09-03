#include "ebu/list/analysis/serialization/compliance.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------

d21::compliance_analyzer d21::build_compliance_analyzer(const d20::video_description& video, d21::vrx_settings settings)
{
    return d21::compliance_analyzer(video.packets_per_frame, video.rate, d20::get_info(video), settings,
                                    video.scan_type, video.dimensions);
}

d21::video_analysis_info d21::get_video_analysis_info(const st2110::d21::compliance_analyzer& ca)
{
    d21::video_analysis_info va;

    const auto compliance = ca.get_compliance();

    va.compliance = compliance.global;

    va.cinst =
        d21::cinst_analysis{compliance.cinst, transform_histogram_samples_to_percentages(ca.get_cinst_histogram()),
                            ca.get_wide_parameters().cmax, ca.get_narrow_parameters().cmax};

    va.vrx = d21::vrx_analysis{compliance.vrx, transform_histogram_samples_to_percentages(ca.get_vrx_histogram()),
                               ca.get_wide_parameters().vrx_full, ca.get_narrow_parameters().vrx_full};

    va.trs = d21::trs_analysis{ca.get_trs()};

    return va;
}

void d21::to_json(nlohmann::json& j, const video_analysis_info& v)
{
    j["compliance"] = v.compliance;
    j["cinst"]      = v.cinst;
    j["vrx"]        = v.vrx;
    j["trs"]        = v.trs;
}

void d21::from_json(const nlohmann::json& j, video_analysis_info& v)
{
    v.compliance = j.at("compliance");
    v.cinst      = j.at("cinst");
    v.vrx        = j.at("vrx");
    v.trs        = j.at("trs");
}

void d21::to_json(nlohmann::json& j, const cinst_analysis& v)
{
    j["compliance"]  = v.compliance;
    j["histogram"]   = v.histogram;
    j["cmax_wide"]   = v.cmax_wide;
    j["cmax_narrow"] = v.cmax_narrow;
}

void d21::from_json(const nlohmann::json& j, cinst_analysis& v)
{
    v.compliance = j.at("compliance");
    // v.histogram = j.at("histogram").get<std::map<int,int>>(); // todo:
    // uncomment and make it compile
    v.cmax_wide   = j.at("cmax_wide");
    v.cmax_narrow = j.at("cmax_narrow");
}

void d21::to_json(nlohmann::json& j, const vrx_analysis& v)
{
    j["compliance"]      = v.compliance;
    j["histogram"]       = v.histogram;
    j["vrx_full_wide"]   = v.vrx_full_wide;
    j["vrx_full_narrow"] = v.vrx_full_narrow;
}

void d21::from_json(const nlohmann::json& j, vrx_analysis& v)
{
    v.compliance = j.at("compliance");
    // v.histogram = j.at("histogram").get<std::map<int,int>>(); // todo:
    // uncomment and make it compile
    v.vrx_full_wide   = j.at("vrx_full_wide");
    v.vrx_full_narrow = j.at("vrx_full_narrow");
}

void d21::to_json(nlohmann::json& j, const trs_analysis& t)
{
    j["trs_ns"] = t.trs_ns;
}

void d21::from_json(const nlohmann::json& j, trs_analysis& t)
{
    t.trs_ns = j.at("trs_ns");
}

void st2110::d21::to_json(nlohmann::json& j, const compliance_profile& v)
{
    switch(v)
    {
    case compliance_profile::narrow: j = "narrow"; break;
    case compliance_profile::narrow_linear: j = "narrow_linear"; break;
    case compliance_profile::wide: j = "wide"; break;
    default:
        LIST_ASSERT(v == compliance_profile::not_compliant);
        j = "not_compliant";
        break;
    }
}

void st2110::d21::from_json(const nlohmann::json& j, compliance_profile& v)
{
    const auto s = j.get<std::string>();

    if(s == "narrow")
        v = compliance_profile::narrow;
    else if(s == "narrow_linear")
        v = compliance_profile::narrow_linear;
    else if(s == "wide")
        v = compliance_profile::wide;
    else
    {
        LIST_ENFORCE(s == "not_compliant", std::runtime_error, "invalid JSON value for compliance_profile");
        v = compliance_profile::narrow;
    }
}
