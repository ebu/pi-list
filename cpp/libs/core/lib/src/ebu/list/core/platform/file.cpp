#include "ebu/list/core/platform/file.h"
#include "ebu/list/core/idioms.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

namespace
{
    FILE* do_open(const path& path, ebu_list::file_handle::mode _mode)
    {

#if _MSC_VER
        const auto mode_string = _mode == ebu_list::file_handle::mode::read ? L"rb" : L"wb";
        FILE* handle;
        const auto open_result = ::_wfopen_s(&handle, path.native().c_str(), mode_string);
        LIST_ENFORCE(open_result == 0, std::runtime_error, "Error opening '{}'", path);
        return handle;
#else
        const auto mode_string = _mode == ebu_list::file_handle::mode::read ? "rb" : "wb";
        FILE* handle           = ::fopen(path.c_str(), mode_string);
        LIST_ENFORCE(handle != nullptr, std::runtime_error, "Error opening '{}'", path);
        return handle;
#endif
    }
} // namespace

ebu_list::file_handle::file_handle(const path& path, mode _mode) : handle_(do_open(path, _mode))
{
}

ebu_list::file_handle::~file_handle()
{
    ::fclose(handle_);
}

FILE* ebu_list::file_handle::handle()
{
    return handle_;
}

ebu_list::file_handle::operator bool() const
{
    return handle_ != nullptr;
}

size_t ebu_list::write(file_handle& f, cbyte_span buffer)
{
    return fwrite(buffer.data(), 1, buffer.length_bytes(), f.handle());
}