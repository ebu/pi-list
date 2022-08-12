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

        using full_type      = std::variant<std::nullopt_t, std::string>;
        using transport_type = std::variant<std::nullopt_t, std::string>;

        [[nodiscard]] virtual detector::status_description handle_data(const rtp::packet& packet) = 0;
        [[nodiscard]] virtual details get_details() const                                         = 0;
        [[nodiscard]] virtual full_type get_full_media_type() const                               = 0;
        [[nodiscard]] virtual transport_type get_transport_type() const                           = 0;
    };

    class sub_detector : public detector
    {
      public:
        virtual std::string get_kind() const noexcept = 0;
    };

    using maybe_media_type = std::optional<media::full_media_type>;

    class format_detector : public rtp::listener
    {
      public:
        format_detector(maybe_media_type media_type);

        void on_data(const rtp::packet& packet) override;
        void on_complete() override;
        void on_error(std::exception_ptr ptr) override;

        detector::status_description status() const noexcept;
        detector::details get_details() const;
        detector::full_type get_full_media_type() const;
        detector::transport_type get_transport_type() const;

        const std::map<std::string, std::vector<std::string>>& get_error_codes() const;

      private:
        std::vector<std::unique_ptr<sub_detector>> detectors_;
        detector::status_description status_description_ =
            detector::status_description{/*.state=*/detector::state::detecting,
                                         /*.error_code*/ "STATUS_CODE_FORMAT_DETECTING"};
        std::map<std::string, std::vector<std::string>> error_codes_list_;
    };
} // namespace ebu_list::st2110
