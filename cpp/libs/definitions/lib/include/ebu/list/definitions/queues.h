/*
 *
 *  THIS FILE MUST MIMIC THE CORRESPONDING JS FILE
 *
 */

#pragma once

#include "bisect/bimo/mq/common.h"

namespace ebu_list::definitions::queues::preprocessor
{
    constexpr auto start_request =
        bisect::bimo::mq::queue_info{"ebu-list.preprocessor.request", false, true, false, false};
} // namespace ebu_list::definitions::queues::preprocessor
