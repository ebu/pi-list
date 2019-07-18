#pragma once

#include "ebu/list/net/ipv4/address.h"

#if defined(LIST_HAS_WIN32)
#include <WinSock2.h>
#else // defined(LIST_HAS_WIN32)
#include <netinet/in.h>
#endif // defined(LIST_HAS_WIN32)

namespace ebu_list
{
	class socket_handle
	{
	public:
#if defined(LIST_HAS_POSIX)
		using socket_t = int;
        constexpr static auto INVALID_SOCKET = -1;
#else // defined(LIST_HAS_POSIX)
		using socket_t = SOCKET;
#endif // defined(LIST_HAS_POSIX)

		socket_handle();
		socket_handle(int af, int type, int protocol = IPPROTO_IP);
		~socket_handle();
		socket_handle(const socket_handle&) = delete;
		socket_handle& operator=(const socket_handle&) = delete;
		socket_handle(socket_handle&& rhs);
		socket_handle& operator=(socket_handle&& rhs);

		bool is_valid() const;
		socket_t get_handle();

	private:
		socket_t handle_ = INVALID_SOCKET;
	};
}
