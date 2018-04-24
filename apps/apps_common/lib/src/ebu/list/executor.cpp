#include "ebu/list/executor.h"
using namespace ebu_list;

//------------------------------------------------------------------------------

executor::executor()
{
}

executor::~executor()
{
    wait();
}

void executor::execute(F f)
{
    futures_.push_back(std::async(std::launch::async, f));
}

void executor::wait()
{
    std::for_each(futures_.begin(), futures_.end(), [](FT& f) {
        f.get();
    });

    futures_.clear();
}
