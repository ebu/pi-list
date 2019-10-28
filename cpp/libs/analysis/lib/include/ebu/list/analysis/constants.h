#pragma once

namespace ebu_list::analysis::constants
{
    constexpr auto meta_filename     = "_meta.json";
    constexpr auto packets_file_name = "packets.json";

    namespace db
    {
        constexpr auto offline = "offline";

        namespace collections
        {
            constexpr auto pcaps   = "pcaps";
            constexpr auto streams = "streams";
        } // namespace collections
    }     // namespace db
} // namespace ebu_list::analysis::constants
