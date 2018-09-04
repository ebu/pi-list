#include "ebu/list/version.h"

//////////////////////////////////////////////////////////////////////

std::string ebu_list::version()
{
    return std::to_string(version_major) + '.' 
        + std::to_string(version_minor) + '.'
        + std::to_string(version_patch);
}