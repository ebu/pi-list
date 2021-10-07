/*
 *
 *  THIS FILE MUST MIMIC THE CORRESPONDING JS FILE
 *
 */

#pragma once

#include "bisect/bimo/mq/common.h"

namespace ebu_list::definitions::exchanges
{
    namespace preprocessor_status
    {
        constexpr auto info =
            bisect::bimo::mq::exchange_info{"ebu-list.preprocessor.status", "fanout", false, false, false};

        namespace keys
        {
            constexpr auto announce = "announce";
        } // namespace keys

        namespace announce::stream_status
        {
            constexpr auto started = "Started";
            constexpr auto stopped = "Stopped";
            constexpr auto failed  = "Failed";
        } // namespace announce::stream_status

    } // namespace preprocessor_status
    namespace extractor_status
    {
        constexpr auto info =
            bisect::bimo::mq::exchange_info{"ebu-list.extractor.status", "fanout", false, false, false};

        namespace keys
        {
            constexpr auto progress = "progress";
        } // namespace keys

    } // namespace extractor_status
} // namespace ebu_list::definitions::exchanges
