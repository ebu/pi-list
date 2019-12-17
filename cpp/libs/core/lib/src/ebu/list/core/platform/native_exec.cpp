#include "ebu/list/core/platform/native_exec.h"

#include "ebu/list/core/platform/config.h"
#include <cstdlib>
#include <stdexcept>

using namespace ebu_list;

// todo: return pair with native exit code
// todo: handle errors
// todo: enable canceling the command
// todo: async

exit_code ebu_list::native_exec(std::string_view command)
{
    const auto result = std::system(command.data());

    if constexpr(platform::config::windows)
    {
        return result < 31 ? exit_code::error : exit_code::success;
    }
    else if constexpr(platform::config::posix)
    {
        return result == 0 ? exit_code::success : exit_code::error;
    }
    else
        throw std::logic_error("Not implemented");
}
