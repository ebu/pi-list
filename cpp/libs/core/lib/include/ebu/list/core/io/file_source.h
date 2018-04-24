#pragma once

#include "ebu/list/core/io/data_source.h"
#include "ebu/list/core/platform/file.h"

//------------------------------------------------------------------------------

namespace ebu_list
{
    class file_source : public data_source
    {
    public:
        explicit file_source(sbuffer_factory_ptr factory, const path& path);

        oview read_next() override;

    private:
        sbuffer_factory_ptr factory_;
        file_handle handle_;
    };
}
