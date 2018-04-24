cmake_minimum_required (VERSION 3.9)

list_declare_library(ebu_list_pcap)

target_link_libraries(${PROJECT_NAME} ebu_list_core ebu_list_net)
define_pch(${PROJECT_NAME} lib/src/ebu/list/pcap/pch.h)
