/*
The MIT License (MIT)

Copyright (c) 2014 Graeme Hill (http://graemehill.ca)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
Slightly adapted by Pedro Ferreira (pedro@bisect.pt)
*/

#pragma once

#if defined(_WIN32)
#define GUID_WINDOWS
#elif defined(__APPLE__)
#define GUID_CFUUID
#else
#define GUID_LIBUUID
#endif

#include <array>
#include <functional>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <utility>

namespace ebu_list
{

    // Class to represent a GUID/UUID. Each instance acts as a wrapper around a
    // 16 byte value that can be passed around by value. It also supports
    // conversion to string (via the stream operator <<) and conversion from a
    // string via constructor.
    class guid
    {
      public:
        guid(const std::array<unsigned char, 16>& bytes);
        guid(const unsigned char* bytes);
        guid(const std::string& fromString);
        guid();
        guid(const guid& other);
        guid& operator=(const guid& other);
        bool operator==(const guid& other) const;
        bool operator!=(const guid& other) const;

        std::string str() const;
        operator std::string() const;
        const std::array<unsigned char, 16>& bytes() const;
        void swap(guid& other);
        bool is_valid() const;

      private:
        void zeroify();

        // actual data
        std::array<unsigned char, 16> _bytes;

        // make the << operator a friend so it can access _bytes
        friend std::ostream& operator<<(std::ostream& s, const guid& guid);
    };

    guid newGuid();
} // namespace ebu_list

namespace std
{
    // Template specialization for std::swap<guid>() --
    template <> inline void swap(ebu_list::guid& lhs, ebu_list::guid& rhs)
    {
        lhs.swap(rhs);
    }

    // Specialization for std::hash<guid> -- this implementation
    // uses std::hash<std::string> on the stringification of the guid
    // to calculate the hash
    template <> struct hash<ebu_list::guid>
    {
        typedef ebu_list::guid argument_type;
        typedef std::size_t result_type;

        result_type operator()(argument_type const& guid) const
        {
            std::hash<std::string> hasher;
            return static_cast<result_type>(hasher(guid.str()));
        }
    };
} // namespace std
