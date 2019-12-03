cmake_minimum_required(VERSION 3.9)

list_declare_library(ebu_list_st2110)

target_link_libraries(${PROJECT_NAME} ebu_list_core ebu_list_rtp ebu_list_analysis)

if (BUILD_TESTS)
    target_link_libraries(${PROJECT_NAME}_unit_tests ebu_list_pcap)
endif ()

define_pch(${PROJECT_NAME} "lib/src/ebu/list/st2110/pch.h")
