#include "ebu/list/core/io/file_source.h"
#include "ebu/list/core/idioms.h"

using namespace ebu_list;

//------------------------------------------------------------------------------

file_source::file_source(sbuffer_factory_ptr factory, const path& path) : factory_(factory), handle_(path)
{
    LIST_ASSERT(factory);
    LIST_ASSERT(handle_);
}

oview file_source::read_next()
{
    constexpr ptrdiff_t read_size = 4096;

    auto block = factory_->get_buffer(read_size);
    LIST_ASSERT(block);
    LIST_ASSERT(block->size() >= read_size);

#if defined(_WIN32)
    const auto read_result = fread_s(block->begin(), block->size(), 1, block->size(), handle_.handle());
#else // defined(_WIN32)
    const auto read_result = fread(block->begin(), 1, block->size(), handle_.handle());
#endif // defined(_WIN32)

    if(read_result == 0)
    {
        // Throw if not EOF
        LIST_ENFORCE(feof(handle_.handle()), std::runtime_error, "End of File was not detected");

        return oview();
    }

    return oview(std::move(block), 0, read_result);
}
