cmake_minimum_required(VERSION 3.9)

list_declare_library(ebu_list_srt)

target_link_libraries(${PROJECT_NAME} ebu_list_core ebu_list_net ebu_list_analysis ebu_list_st2110)
