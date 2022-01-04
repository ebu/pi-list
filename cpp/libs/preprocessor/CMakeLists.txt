cmake_minimum_required(VERSION 3.9)

list_declare_library(ebu_list_preprocessor)

target_link_libraries(${PROJECT_NAME} ebu_list_analysis ebu_list_pcap ebu_list_ptp ebu_list_srt)
