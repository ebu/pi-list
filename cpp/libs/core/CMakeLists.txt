cmake_minimum_required (VERSION 3.9)

list_declare_library(ebu_list_core)

#-------------------------------------------------------------------------------
# The version number
set (EBU_LIST_VERSION_MAJOR 0)
set (EBU_LIST_VERSION_MINOR 0)
set (EBU_LIST_VERSION_PATCH 1)

# create a header file to pass some settings to the source code
configure_file(
        "${PROJECT_SOURCE_DIR}/lib/src/config.h.in"
        "${PROJECT_BINARY_DIR}/include/ebu/list/config.h"
)
#
#-------------------------------------------------------------------------------

if(APPLE)
    target_link_libraries(${PROJECT_NAME} c++experimental -L/usr/local/opt/llvm/lib/)

    find_library(CFLIB CoreFoundation)
    target_link_libraries(${PROJECT_NAME} ${CFLIB})
endif()

target_link_libraries(${PROJECT_NAME}
    bimo
    GSL
    CONAN_PKG::spdlog
    CONAN_PKG::fmt
)

#-------------------------------------------------------------------------------
find_package(Threads REQUIRED)
if(THREADS_HAVE_PTHREAD_ARG)
    target_compile_options(${PROJECT_NAME} PUBLIC "-pthread")
endif()
if(CMAKE_THREAD_LIBS_INIT)
    target_link_libraries(${PROJECT_NAME} ${CMAKE_THREAD_LIBS_INIT})
endif()

if(CMAKE_COMPILER_IS_GNUCXX)
    target_link_libraries(${PROJECT_NAME} stdc++fs uuid)
endif()

define_pch(${PROJECT_NAME} lib/src/ebu/list/core/pch.h)
