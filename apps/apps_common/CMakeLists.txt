cmake_minimum_required (VERSION 3.9)

list_declare_library(apps_common)

target_link_libraries(apps_common
        ebu_list_core
        ebu_list_st2110
        influxdb-cpp-rest
        CONAN_PKG::jsonformoderncpp
        CONAN_PKG::mongo-cxx-driver
)

define_pch(${PROJECT_NAME} lib/src/pch.h)
