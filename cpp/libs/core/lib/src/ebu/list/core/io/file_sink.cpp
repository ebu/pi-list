#include "ebu/list/core/io/file_sink.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;

//------------------------------------------------------------------------------

file_sink::file_sink(const path& path) : handle_(path, file_handle::mode::write)
{
    LIST_ASSERT(handle_);
}

void file_sink::write(cbyte_span data)
{
    const auto write_result = fwrite(data.data(), 1, data.size_bytes(), handle_.handle());

    LIST_ENFORCE(write_result == static_cast<size_t>(data.size_bytes()), std::runtime_error,
                 "Error writing to file: {}", write_result);
}
