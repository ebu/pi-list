#pragma once

#include "ebu/list/core/memory/bimo.h"
#include "ebu/list/core/types.h"
#include "ebu/list/ptp/message.h"
#include <array>

//------------------------------------------------------------------------------

namespace ebu_list::ptp
{
    template <class Header, class MessageBody, class MessageLens> class base_message
    {
        clock::time_point packet_timestamp_;
        Header header_;
        mapped_oview<MessageBody> body_;
        MessageLens message_lens_;

      protected:
        explicit base_message(clock::time_point packet_timestamp, Header&& header, oview&& sdu)
            : packet_timestamp_(packet_timestamp), header_(std::move(header)), body_(std::move(sdu)),
              message_lens_(body_.value())
        {
        }

      public:
        const Header& header() const noexcept { return header_; }

        const MessageLens& message() const noexcept { return message_lens_; }

        clock::time_point packet_timestamp() const { return packet_timestamp_; }
    };
} // namespace ebu_list::ptp
