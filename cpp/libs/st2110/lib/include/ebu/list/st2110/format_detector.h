#pragma once

#include "ebu/list/rtp/listener.h"
#include "ebu/list/st2110/d20/video_description.h"
#include "ebu/list/st2110/d30/audio_description.h"
#include "ebu/list/st2110/d40/anc_description.h"
#include "ebu/list/ttml/ttml_description.h"
#include <map>
#include <variant>

namespace ebu_list::st2110
{
    class detector
    {
      public:
        virtual ~detector() = default;

        enum class state
        {
            detecting,
            valid,
            invalid
        };

        struct status_description
        {
            detector::state state;
            std::string error_code;
        };

        using details = std::variant<std::nullopt_t, d20::video_description, d30::audio_description,
                                     d40::anc_description, ebu_list::ttml::description>;

        virtual detector::status_description handle_data(const rtp::packet& packet) = 0;
        virtual details get_details() const                                         = 0;
        virtual std::string get_full_media_type() const                                 = 0;
    };

    class sub_detector : public detector
    {
      public:
        virtual std::string get_kind() const noexcept = 0;
    };

    class format_detector : public rtp::listener
    {
      public:
        explicit format_detector(rtp::packet first_packet);

        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        detector::status_description status() const noexcept;
        detector::details get_details() const;
        std::string get_full_media_type() const;

        const std::map<std::string, std::vector<std::string>>& get_error_codes() const;

      private:
        std::vector<std::unique_ptr<sub_detector>> detectors_;
        detector::status_description status_description_ =
            detector::status_description{/*.state=*/detector::state::detecting,
                                         /*.error_code*/ "STATUS_CODE_FORMAT_DETECTING"};
        std::map<std::string, std::vector<std::string>> error_codes_list_;
    };
} // namespace ebu_list::st2110
