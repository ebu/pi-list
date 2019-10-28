#include "pch.h"

#include "ebu/list/test_config.h"
#include "ebu/list/test_lib/sample_files.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

path test_lib::sample_file(path relative_path_to_file)
{
    return path(detail::sample_data_root_dir) / relative_path_to_file;
}
