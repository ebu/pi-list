cmake_minimum_required(VERSION 3.9)

list_declare_library(ebu_list_net)

target_link_libraries(${PROJECT_NAME} ebu_list_core CONAN_PKG::boost)
