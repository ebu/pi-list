#include "ebu/list/net/socket_handle.h"
#include "ebu/list/core/io/logger.h"

#if defined(LIST_HAS_POSIX)
#include <arpa/inet.h>
#include <net/if.h>
#include <netinet/in.h>
#include <sys/ioctl.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <unistd.h>
#endif // defined(LIST_HAS_POSIX)

using namespace ebu_list;

//------------------------------------------------------------------------------

socket_handle::socket_handle()
{
}

socket_handle::socket_handle(int af, int type, int protocol) : handle_(::socket(af, type, protocol))
{
}

socket_handle::~socket_handle()
{
    if(handle_ == INVALID_SOCKET) return;

#if defined(LIST_HAS_POSIX)
    ::close(handle_);
#else  // defined(LIST_HAS_POSIX)
    ::closesocket(handle_);
#endif // defined(LIST_HAS_POSIX)
}

socket_handle::socket_handle(socket_handle&& rhs)
{
    this->handle_ = rhs.handle_;
    rhs.handle_   = INVALID_SOCKET;
}

socket_handle& socket_handle::operator=(socket_handle&& rhs)
{
    this->handle_ = rhs.handle_;
    rhs.handle_   = INVALID_SOCKET;
    return *this;
}

bool socket_handle::is_valid() const
{
    return handle_ != INVALID_SOCKET;
}

socket_handle::socket_t socket_handle::get_handle()
{
    return handle_;
}
