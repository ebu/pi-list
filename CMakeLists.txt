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

execute_process(COMMAND bash "${PROJECT_SOURCE_DIR}/scripts/reset_libssl_permissions.sh"
        WORKING_DIRECTORY "${PROJECT_SOURCE_DIR}")

# -------------------------------------------------------------------------
# conan
conan_check()

# Remove repositories used in older versions
conan_remove_remote(NAME conan-center)
conan_remove_remote(NAME bincrafters)
conan_remove_remote(NAME bisect)
# Add conan center
conan_add_remote(NAME conancenter URL https://center.conan.io)

conan_cmake_run(CONANFILE conanfile.txt
        BASIC_SETUP CMAKE_TARGETS
        BUILD missing mongo-c-driver mongo-cxx-driver # Build from source, otherwise it may fail due to being built against a different glibc)

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
