#include "ebu/list/version.h"

//////////////////////////////////////////////////////////////////////

std::string ebu_list::version()
{
    using namespace std;

    return to_string(version_major) + '.' 
        + to_string(version_minor) + '.'
        + to_string(version_patch);
}