cmake_minimum_required (VERSION 3.9)

project (ebu_list_all)

set(CMAKE_MODULE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/config/cmake" "${CMAKE_CURRENT_SOURCE_DIR}/third_party/bimo/config/cmake")
include(options)
include(conan)
include(cpp-requirements)
include(ebu-list-cpp-requirements)
include(list-version)

configure_file(
        "${PROJECT_SOURCE_DIR}/scripts/version.yml.in"
        "${PROJECT_SOURCE_DIR}/apps/listwebserver/version.yml"
)

# -------------------------------------------------------------------------
# conan
conan_check()
conan_add_remote(NAME bincrafters URL https://api.bintray.com/conan/bincrafters/public-conan)
conan_add_remote(NAME conan-center URL https://conan.bintray.com)
conan_add_remote(NAME bisect URL https://api.bintray.com/conan/bisect/bisect)

conan_cmake_run(CONANFILE conanfile.txt
        BASIC_SETUP CMAKE_TARGETS
        BUILD missing)
# -------------------------------------------------------------------------

if(${CMAKE_GENERATOR} MATCHES "Visual Studio.*")
    include(${CMAKE_BINARY_DIR}/conanbuildinfo_multi.cmake)
else()
    include(${CMAKE_BINARY_DIR}/conanbuildinfo.cmake)
endif()

list_set_cpp_properties()

set_property(GLOBAL PROPERTY USE_FOLDERS ON)

add_subdirectory(third_party)

if(BUILD_TESTS)
    enable_testing()
endif()

message(STATUS "====== LIBS ======")
add_subdirectory(cpp/libs)
message(STATUS "==================")

if(BUILD_APPS)
    message(STATUS "====== APPS ======")
    add_subdirectory(cpp/apps)
    message(STATUS "==================")
endif()

if(BUILD_DEMOS)
    message(STATUS "===== DEMOS ======")
    add_subdirectory(cpp/demos)
    message(STATUS "==================")
endif()
