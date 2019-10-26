cmake_minimum_required(VERSION 3.9)

list_declare_library(ebu_list_analysis)
target_link_libraries(${PROJECT_NAME}
        ebu_list_core
        ebu_list_pcap
        ebu_list_st2110
        ebu_list_rtp
        ebu_list_ptp
        libklvanc
        CONAN_PKG::jsonformoderncpp
        CONAN_PKG::libpng)
