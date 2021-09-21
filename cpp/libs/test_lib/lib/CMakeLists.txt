cmake_minimum_required(VERSION 3.9)
project(ebu_list_test_lib CXX)

list_set_cpp_properties()

file(GLOB_RECURSE ${PROJECT_NAME}_source_files *.cpp *.h)
add_library(${PROJECT_NAME} STATIC ${${PROJECT_NAME}_source_files})
source_group(TREE ${PROJECT_SOURCE_DIR} FILES ${${PROJECT_NAME}_source_files})

target_include_directories(${PROJECT_NAME}
        PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<BUILD_INTERFACE:${PROJECT_BINARY_DIR}/include>
        $<INSTALL_INTERFACE:include>
        PRIVATE
        src
        )
list_set_target_cpp_properties()
set_target_properties(${PROJECT_NAME} PROPERTIES FOLDER "libs")

#-------------------------------------------------------------------------------
# Create a config file for tests.
file(TO_CMAKE_PATH "${CMAKE_CURRENT_SOURCE_DIR}/../../../../sample_data" EBU_LIST_SAMPLE_DATA_ROOT)

# create a header file to pass some settings to the source code
configure_file(
        "${PROJECT_SOURCE_DIR}/test_config.h.in"
        "${PROJECT_BINARY_DIR}/include/ebu/list/test_config.h"
)
#-------------------------------------------------------------------------------
target_link_libraries(${PROJECT_NAME}
        ebu_list_core
        CONAN_PKG::catch2
        ${${PROJECT_NAME}_LINK_FLAGS}
        )

# Catch Test Library test discovery (using both "debug" and "normal" so that it works for normal and multi cmake)
include(${CONAN_LIB_DIRS_CATCH2}/cmake/Catch2/ParseAndAddCatchTests.cmake)
