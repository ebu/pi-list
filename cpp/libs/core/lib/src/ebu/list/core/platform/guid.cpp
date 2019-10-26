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

#include "ebu/list/core/platform/guid.h"
#include <cstring>

#ifdef GUID_LIBUUID
#include <uuid/uuid.h>
#endif

#ifdef GUID_CFUUID
#include <CoreFoundation/CFUUID.h>
#endif

#ifdef GUID_WINDOWS
#include <objbase.h>
#endif

namespace ebu_list
{
    // overload << so that it's easy to convert to a string
    std::ostream& operator<<(std::ostream& s, const guid& guid)
    {
        return s << std::hex << std::setfill('0') << std::setw(2) << static_cast<int>(guid._bytes[0]) << std::setw(2)
                 << static_cast<int>(guid._bytes[1]) << std::setw(2) << static_cast<int>(guid._bytes[2]) << std::setw(2)
                 << static_cast<int>(guid._bytes[3]) << "-" << std::setw(2) << static_cast<int>(guid._bytes[4])
                 << std::setw(2) << static_cast<int>(guid._bytes[5]) << "-" << std::setw(2)
                 << static_cast<int>(guid._bytes[6]) << std::setw(2) << static_cast<int>(guid._bytes[7]) << "-"
                 << std::setw(2) << static_cast<int>(guid._bytes[8]) << std::setw(2) << static_cast<int>(guid._bytes[9])
                 << "-" << std::setw(2) << static_cast<int>(guid._bytes[10]) << std::setw(2)
                 << static_cast<int>(guid._bytes[11]) << std::setw(2) << static_cast<int>(guid._bytes[12])
                 << std::setw(2) << static_cast<int>(guid._bytes[13]) << std::setw(2)
                 << static_cast<int>(guid._bytes[14]) << std::setw(2) << static_cast<int>(guid._bytes[15]);
    }

    bool guid::is_valid() const
    {
        static const guid empty;
        return *this != empty;
    }

    // convert to string using std::snprintf() and std::string
    std::string guid::str() const
    {
        char one[10], two[6], three[6], four[6], five[14];

        snprintf(one, 10, "%02x%02x%02x%02x", _bytes[0], _bytes[1], _bytes[2], _bytes[3]);
        snprintf(two, 6, "%02x%02x", _bytes[4], _bytes[5]);
        snprintf(three, 6, "%02x%02x", _bytes[6], _bytes[7]);
        snprintf(four, 6, "%02x%02x", _bytes[8], _bytes[9]);
        snprintf(five, 14, "%02x%02x%02x%02x%02x%02x", _bytes[10], _bytes[11], _bytes[12], _bytes[13], _bytes[14],
                 _bytes[15]);
        const std::string sep("-");
        std::string out(one);

        out += sep + two;
        out += sep + three;
        out += sep + four;
        out += sep + five;

        return out;
    }

    // conversion operator for std::string
    guid::operator std::string() const { return str(); }

    // Access underlying bytes
    const std::array<unsigned char, 16>& guid::bytes() const { return _bytes; }

    // create a guid from vector of bytes
    guid::guid(const std::array<unsigned char, 16>& bytes) : _bytes(bytes) {}

    // create a guid from array of bytes
    guid::guid(const unsigned char* bytes) { std::copy(bytes, bytes + 16, std::begin(_bytes)); }

    // converts a single hex char to a number (0 - 15)
    unsigned char hexDigitToChar(char ch)
    {
        // 0-9
        if (ch > 47 && ch < 58) return ch - 48;

        // a-f
        if (ch > 96 && ch < 103) return ch - 87;

        // A-F
        if (ch > 64 && ch < 71) return ch - 55;

        return 0;
    }

    bool isValidHexChar(char ch)
    {
        // 0-9
        if (ch > 47 && ch < 58) return true;

        // a-f
        if (ch > 96 && ch < 103) return true;

        // A-F
        if (ch > 64 && ch < 71) return true;

        return false;
    }

    // converts the two hexadecimal characters to an unsigned char (a byte)
    unsigned char hexPairToChar(char a, char b) { return hexDigitToChar(a) * 16 + hexDigitToChar(b); }

    // create a guid from string
    guid::guid(const std::string& fromString)
    {
        char charOne             = '\0';
        char charTwo             = '\0';
        bool lookingForFirstChar = true;
        unsigned nextByte        = 0;

        for (const char& ch : fromString)
        {
            if (ch == '-') continue;

            if (nextByte >= 16 || !isValidHexChar(ch))
            {
                // Invalid string so bail
                zeroify();
                return;
            }

            if (lookingForFirstChar)
            {
                charOne             = ch;
                lookingForFirstChar = false;
            }
            else
            {
                charTwo             = ch;
                auto byte           = hexPairToChar(charOne, charTwo);
                _bytes[nextByte++]  = byte;
                lookingForFirstChar = true;
            }
        }

        // if there were fewer than 16 bytes in the string then guid is bad
        if (nextByte < 16)
        {
            zeroify();
            return;
        }
    }

    guid::guid() : _bytes{0} {}

    guid::guid(const guid& other) : _bytes(other._bytes) {}

    void guid::zeroify() { std::fill(_bytes.begin(), _bytes.end(), static_cast<unsigned char>(0)); }

    guid& guid::operator=(const guid& other)
    {
        guid(other).swap(*this);
        return *this;
    }

    bool guid::operator==(const guid& other) const { return _bytes == other._bytes; }

    bool guid::operator!=(const guid& other) const { return !((*this) == other); }

    void guid::swap(guid& other) { _bytes.swap(other._bytes); }

// This is the linux friendly implementation, but it could work on other
// systems that have libuuid available
#ifdef GUID_LIBUUID
    guid newGuid()
    {
        uuid_t id;
        uuid_generate(id);
        return id;
    }
#endif

// this is the mac and ios version
#ifdef GUID_CFUUID
    guid newGuid()
    {
        auto newId = CFUUIDCreate(NULL);
        auto bytes = CFUUIDGetUUIDBytes(newId);
        CFRelease(newId);

        std::array<unsigned char, 16> byteArray = {bytes.byte0,  bytes.byte1,  bytes.byte2,  bytes.byte3,
                                                   bytes.byte4,  bytes.byte5,  bytes.byte6,  bytes.byte7,
                                                   bytes.byte8,  bytes.byte9,  bytes.byte10, bytes.byte11,
                                                   bytes.byte12, bytes.byte13, bytes.byte14, bytes.byte15};
        return byteArray;
    }
#endif

// obviously this is the windows version
#ifdef GUID_WINDOWS
    guid newGuid()
    {
        GUID newId;
        CoCreateGuid(&newId);

        std::array<unsigned char, 16> bytes = {(unsigned char)((newId.Data1 >> 24) & 0xFF),
                                               (unsigned char)((newId.Data1 >> 16) & 0xFF),
                                               (unsigned char)((newId.Data1 >> 8) & 0xFF),
                                               (unsigned char)((newId.Data1) & 0xff),

                                               (unsigned char)((newId.Data2 >> 8) & 0xFF),
                                               (unsigned char)((newId.Data2) & 0xff),

                                               (unsigned char)((newId.Data3 >> 8) & 0xFF),
                                               (unsigned char)((newId.Data3) & 0xFF),

                                               (unsigned char)newId.Data4[0],
                                               (unsigned char)newId.Data4[1],
                                               (unsigned char)newId.Data4[2],
                                               (unsigned char)newId.Data4[3],
                                               (unsigned char)newId.Data4[4],
                                               (unsigned char)newId.Data4[5],
                                               (unsigned char)newId.Data4[6],
                                               (unsigned char)newId.Data4[7]};

        return bytes;
    }
#endif
} // namespace ebu_list
