#pragma once

#include "ebu/list/core/types.h"

namespace ebu_list
{
    void write_available_options(const path& dir);
    void write_available_options_for_video(const path& dir);
    void write_available_options_for_audio(const path& dir);
    void write_available_options_for_ancillary(const path& dir);
}
