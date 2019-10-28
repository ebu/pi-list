#include "ebu/list/core/io/chunked_data_source.h"
#include "ebu/list/core/idioms.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

chunked_data_source::chunked_data_source(sbuffer_factory_ptr factory, data_source_uptr source)
    : factory_(factory), source_(std::move(source))
{
    LIST_ENFORCE(source_, std::runtime_error, "Invalid source");
}

oview chunked_data_source::read_exactly(ptrdiff_t amount)
{
    auto s = try_read_exactly(amount);
    LIST_ENFORCE(size(s) == amount, std::runtime_error, "Couldn't read the requested amount");
    return s;
}

sbuffer_factory& chunked_data_source::get_factory() const
{
    return *factory_;
}

size_t chunked_data_source::get_current_offset() const
{
    return current_offset_;
}

oview chunked_data_source::try_read_exactly(ptrdiff_t amount)
{
    if (!cache_)
    {
        cache_ = source_->read_next();
    }

    while (size(cache_) < amount)
    {
        auto next = source_->read_next();
        if (!next)
        {
            break;
        }

        cache_ = merge(*factory_, std::move(cache_), std::move(next));
    }

    if (size(cache_) >= amount)
    {
        auto [left, right] = split(std::move(cache_), amount);
        cache_             = std::move(right);

        current_offset_ += left.view().size_bytes();

        return left;
    }
    else
    {
        current_offset_ += cache_.view().size_bytes();
        return std::move(cache_);
    }
}
