#include "ebu/list/st2110/frame_start_filter.h"
#include "ebu/list/st2110/pch.h"

using namespace ebu_list;
using namespace ebu_list::st2110;

//------------------------------------------------------------------------------

struct frame_start_filter::impl
{
    explicit impl(listener_uptr listener) : listener_(std::move(listener)) {}

    void on_data(const rtp::packet& p)
    {
        if(in_frame_)
        {
            ++packet_index_;
            listener_->on_data({p, frame_start_, packet_index_});

            if(frame_start_)
            {
                packet_index_ = 0;
                frame_start_ = false;
            }
        }

        if(p.info.rtp.view().marker())
        {
            in_frame_     = true;
            frame_start_  = true;
        }
    }

    listener_uptr listener_;
    bool frame_start_ = false;
    bool in_frame_    = false;
    int packet_index_ = 0; // The index of the next packet in the current frame
};

//------------------------------------------------------------------------------

frame_start_filter::frame_start_filter(listener_uptr l) : impl_(std::make_unique<impl>(std::move(l)))
{
}

frame_start_filter::~frame_start_filter() = default;

void frame_start_filter::on_data(const rtp::packet& p)
{
    impl_->on_data(p);
}

void frame_start_filter::on_complete()
{
    impl_->listener_->on_complete();
}

void frame_start_filter::on_error(std::exception_ptr e)
{
    impl_->listener_->on_error(e);
}
