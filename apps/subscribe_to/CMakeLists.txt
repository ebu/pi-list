cmake_minimum_required (VERSION 3.9)
project(subscribe_to)
list_add_executable(subscribe_to)

target_link_libraries (${PROJECT_NAME}
    bicla
	ebu_list_core
	ebu_list_net
    ${${PROJECT_NAME}_LINK_FLAGS}
)