cmake_minimum_required(VERSION 3.9)

list_declare_library(apps_common)

target_link_libraries(apps_common
        ebu_list_core
        ebu_list_pcap
        ebu_list_st2110
        ebu_list_analysis
        influxdb-cpp-rest
        libklvanc
        CONAN_PKG::jsonformoderncpp
        CONAN_PKG::libpng
        CONAN_PKG::mongo-cxx-driver
        )
