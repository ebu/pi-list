#include "png_writer.h"
#define EBU_LIST_USE_LIBPNG


#if defined(EBU_LIST_USE_LIBPNG)
#include "png.h"
#else // defined(EBU_LIST_USE_LIBPNG)
#include "lodepng.h"
#endif // defined(EBU_LIST_USE_LIBPNG)

using namespace ebu_list;

#if defined(EBU_LIST_USE_LIBPNG)

#define ASSERT_EX(cond, error_message) do { if (!(cond)) { std::cerr << error_message; exit(1);} } while(0)

namespace
{
    static void PngWriteCallback(png_structp  png_ptr, png_bytep data, png_size_t length) {
        auto p = static_cast<std::vector<uint8_t>*>(png_get_io_ptr(png_ptr));
        p->insert(p->end(), data, data + length);
    }

    struct TPngDestructor {
        png_struct *p;
        TPngDestructor(png_struct *png) : p(png) {}
        ~TPngDestructor() { if (p) { png_destroy_write_struct(&p, nullptr); } }
    };

    void user_error_fn(png_structp /*png_ptr*/,
        png_const_charp error_msg)
    {
        (void)error_msg;
    }

    void user_warning_fn(png_structp /*png_ptr*/,
        png_const_charp warning_msg)
    {
        (void)warning_msg;
    }
}

void ebu_list::write_png(oview data, media::video::video_dimensions dimensions, path target)
{
    const auto buffer = reinterpret_cast<const uint8_t*>(data.view().data());
    const auto w = dimensions.width;
    const auto h = dimensions.height;

    if(w == 0 || h == 0)
    {
        logger()->error("Invalid dimensions: {}x{}", w, h);
        // TODO: send error message
        return;
    }

    std::vector<uint8_t> out;

    void* user_error_ptr = nullptr; // TODO: fix error handling
    png_structp p = png_create_write_struct(PNG_LIBPNG_VER_STRING, static_cast<png_voidp>(user_error_ptr),
        user_error_fn, user_warning_fn);
    ASSERT_EX(p, "png_create_write_struct() failed");
    TPngDestructor destroyPng(p);
    png_infop info_ptr = png_create_info_struct(p);
    ASSERT_EX(info_ptr, "png_create_info_struct() failed");
    
    // TODO: check error handling
    //ASSERT_EX(0 == setjmp(png_jmpbuf(p)), "setjmp(png_jmpbuf(p) failed");

    png_set_IHDR(p, info_ptr, w, h, 8,
        PNG_COLOR_TYPE_RGBA,
        PNG_INTERLACE_NONE,
        PNG_COMPRESSION_TYPE_DEFAULT,
        PNG_FILTER_TYPE_DEFAULT);
    //png_set_compression_level(p, 1);
    std::vector<uint8_t*> rows(h);
    for (size_t y = 0; y < h; ++y)
        rows[y] = (uint8_t*)buffer + y * w * 4;
    png_set_rows(p, info_ptr, &rows[0]);
    png_set_write_fn(p, &out, PngWriteCallback, nullptr);
    png_write_png(p, info_ptr, PNG_TRANSFORM_IDENTITY, nullptr);

    file_handle f(target, file_handle::mode::write);
    const auto count = fwrite(&out[0], 1, out.size(), f.handle());
    LIST_ENFORCE(count == out.size(), std::runtime_error, "Did not write the full PNG buffer");
}

#else // defined(EBU_LIST_USE_LIBPNG)

void ebu_list::write_png(oview data, media::video::video_dimensions dimensions, path target)
{
    const auto buffer = reinterpret_cast<const uint8_t*>(data.view().data());
    const auto length = static_cast<int>(data.view().size_bytes());

    unsigned error = lodepng_encode32_file(target.string().c_str(), buffer, dimensions.width, dimensions.height);

    // if there's an error, display it
    if (error) printf("error %u: %s\n", error, lodepng_error_text(error));
}
#endif // defined(EBU_LIST_USE_LIBPNG)
