#include "ebu/list/analysis/utils/color_conversion.h"

#include "bisect/bimo/memory/malloc_sbuffer_factory.h"

using namespace ebu_list;
using namespace bisect::bimo;

namespace
{
    std::tuple<uint8_t, uint8_t, uint8_t> ycbcr_to_rgb(int y, int cb, int cr)
    {
        auto Y  = static_cast<double>(y);
        auto Cb = static_cast<double>(cb);
        auto Cr = static_cast<double>(cr);

        auto r = static_cast<uint8_t>((Y + 1.40200 * (Cr - 0x80)));
        auto g = static_cast<uint8_t>((Y - 0.34414 * (Cb - 0x80) - 0.71414 * (Cr - 0x80)));
        auto b = static_cast<uint8_t>((Y + 1.77200 * (Cb - 0x80)));

        r = std::max(uint8_t(0), std::min(uint8_t(255), r));
        g = std::max(uint8_t(0), std::min(uint8_t(255), g));
        b = std::max(uint8_t(0), std::min(uint8_t(255), b));

        return {r, g, b};
    }
} // namespace

oview analysis::from_ycbcr422_to_rgba(oview ycbcr422, media::video::video_dimensions dimensions)
{
    const auto width           = dimensions.width;
    const auto height          = dimensions.height;
    const auto rgba_line_size  = width * 4;
    const auto rgba_frame_size = height * rgba_line_size;
    // const auto input_stride = width * 5 / 2;
    constexpr auto pixels_per_pgroup = 2;

    malloc_sbuffer_factory f;
    auto target = f.get_buffer(rgba_frame_size);

    auto input = ycbcr422.view().begin();

    for(auto y = 0; y < height; ++y)
    {
        auto output = target->begin() + y * rgba_line_size;

        for(auto x = 0; x < width; x += pixels_per_pgroup)
        {
            //      Cb         Y0        Cr         Y1
            // XXXXXXXX XX++++++ ++++XXXX XXXXXX++ ++++++++
            //     0        1        2        3        4

            auto cb = static_cast<uint8_t>(input[0]);

            auto y0 = static_cast<uint8_t>((input[1] & byte(0x3F)) << 2);
            y0 |= static_cast<uint8_t>((input[2] & byte(0xC0)) >> 6);

            auto cr = static_cast<uint8_t>((input[2] & byte(0x0F)) << 4);
            cr |= static_cast<uint8_t>((input[3] & byte(0xF0)) >> 4);

            // Y1
            auto y1 = static_cast<uint8_t>((input[3] & byte(0x03)) << 6);
            y1 |= static_cast<uint8_t>((input[4] & byte(0xFC)) >> 2);

            const auto [r1, g1, b1] = ycbcr_to_rgb(y0, cb, cr);
            const auto [r0, g0, b0] = ycbcr_to_rgb(y0, cb, cr);

            output[0] = byte(r0);
            output[1] = byte(g0);
            output[2] = byte(b0);
            output[3] = byte(0xFF);
            output[4] = byte(r1);
            output[5] = byte(g1);
            output[6] = byte(b1);
            output[7] = byte(0xFF);

            input += 5;
            output += 8;
        }
    }

    return oview(std::move(target), 0, rgba_frame_size);
}

oview analysis::from_ycbcr422_to_uyvy(oview ycbcr422, media::video::video_dimensions dimensions)
{
    const auto width           = dimensions.width;
    const auto height          = dimensions.height;
    const auto uyvy_line_size  = width * 2;
    const auto uyvy_frame_size = height * uyvy_line_size;
    // const auto input_stride = width * 5 / 2;
    constexpr auto pixels_per_pgroup = 2;

    malloc_sbuffer_factory f;
    auto target = f.get_buffer(uyvy_frame_size);

    auto input = ycbcr422.view().begin();

    for(auto y = 0; y < height; ++y)
    {
        auto output = target->begin() + y * uyvy_line_size;

        for(auto x = 0; x < width; x += pixels_per_pgroup)
        {
            //      Cb         Y0        Cr         Y1
            // XXXXXXXX XX++++++ ++++XXXX XXXXXX++ ++++++++
            //     0        1        2        3        4

            // Cb
            *output = static_cast<byte>(input[0] >> 2);
            ++output;

            // Y0
            *output = static_cast<byte>((input[1] & byte(0x3F)) << 2);
            *output |= static_cast<byte>((input[2] & byte(0xC0)) >> 6);
            ++output;

            // Cr
            *output = static_cast<byte>((input[2] & byte(0x0F)) << 4);
            *output |= static_cast<byte>((input[3] & byte(0xF0)) >> 4);
            ++output;

            // Y1
            *output = static_cast<byte>((input[3] & byte(0x03)) << 6);
            *output |= static_cast<byte>((input[4] & byte(0xFC)) >> 2);
            ++output;

            input += 5;
        }
    }

    return oview(std::move(target), 0, uyvy_frame_size);
}
