cmake_minimum_required (VERSION 3.9)

project (ebu_list_all)

set(CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/config/cmake")

option(USE_PCH "Use Cotire for PCH" ON)
option(BUILD_DEMOS "Build LIST SDK Demos" OFF)
option(BUILD_TESTS "Build tests for LIST SDK" OFF)
option(BUILD_APPS "Build LIST apps" OFF)
option(BUILD_ALL "Build all targets" OFF)

if(BUILD_ALL)
    set(BUILD_DEMOS ON)
    set(BUILD_TESTS ON)
    set(BUILD_APPS ON)
endif()

message(STATUS "USE_PCH: " ${USE_PCH})
message(STATUS "BUILD_DEMOS: " ${BUILD_DEMOS})
message(STATUS "BUILD_TESTS: " ${BUILD_TESTS})
message(STATUS "BUILD_APPS: " ${BUILD_APPS})

if(USE_PCH AND UNIX)
    message(WARNING "Pre-compiled headers via cotire can't be used on a UNIX platform. Use -DUSE_PCH=OFF to hide this message")
    set(USE_PCH OFF)
endif()

if(USE_PCH)
    include(cotire)
    set(COTIRE_MINIMUM_NUMBER_OF_TARGET_SOURCES 1)
endif()

set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)

# -------------------------------------------------------------------------
# conan

include(conan)
conan_cmake_run(CONANFILE conanfile.txt
        BASIC_SETUP CMAKE_TARGETS
        BUILD missing)
# -------------------------------------------------------------------------

if(WIN32)
    include(${CMAKE_CURRENT_BINARY_DIR}/conanbuildinfo_multi.cmake)
endif()

include(cpp-requirements)
list_set_cpp_properties()

set_property(GLOBAL PROPERTY USE_FOLDERS ON)

add_subdirectory(third_party)

if(BUILD_TESTS)
    enable_testing ()

	if(!WIN32)
		set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g -O0 -fprofile-arcs -ftest-coverage") # for coverage
	endif()
endif()

message(STATUS "====== LIBS ======")
add_subdirectory(cpp/libs/test_lib)
add_subdirectory(cpp/libs/core)
add_subdirectory(cpp/libs/net)
add_subdirectory(cpp/libs/rtp)
add_subdirectory(cpp/libs/pcap)
add_subdirectory(cpp/libs/st2110)
add_subdirectory(cpp/libs/ptp)
message(STATUS "==================")

if(BUILD_APPS)
    message(STATUS "====== APPS ======")
    add_subdirectory(apps)
    message(STATUS "==================")
endif()

if(BUILD_DEMOS)
    message(STATUS "===== DEMOS ======")
    add_subdirectory(cpp/demos)
    message(STATUS "==================")
endif()
