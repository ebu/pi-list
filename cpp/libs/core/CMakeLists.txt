cmake_minimum_required (VERSION 3.9)

list_declare_library(ebu_list_core)

# create a header file to pass some settings to the source code
configure_file(
    "${PROJECT_SOURCE_DIR}/lib/src/config.h.in"
    "${PROJECT_BINARY_DIR}/include/ebu/list/version_config.h"
)

#-------------------------------------------------------------------------------

if(APPLE)
    target_link_libraries(ebu_list_core c++experimental -L/usr/local/opt/llvm/lib/)

    find_library(CFLIB CoreFoundation)
    target_link_libraries(ebu_list_core ${CFLIB})
endif()

target_link_libraries(ebu_list_core
    bimo
    GSL
    CONAN_PKG::spdlog
    CONAN_PKG::fmt
)

#-------------------------------------------------------------------------------
find_package(Threads REQUIRED)
if(THREADS_HAVE_PTHREAD_ARG)
    target_compile_options(ebu_list_core PUBLIC "-pthread")
endif()
if(CMAKE_THREAD_LIBS_INIT)
    target_link_libraries(ebu_list_core ${CMAKE_THREAD_LIBS_INIT})
endif()

if(CMAKE_COMPILER_IS_GNUCXX)
    target_link_libraries(ebu_list_core stdc++fs uuid)
endif()

define_pch(ebu_list_core lib/src/ebu/list/core/pch.h)
