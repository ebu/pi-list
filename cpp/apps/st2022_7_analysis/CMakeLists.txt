cmake_minimum_required(VERSION 3.9)

list_add_executable(st2022_7_analysis)

target_link_libraries(${PROJECT_NAME}
        apps_common
        ebu_list_analysis
        ebu_list_ptp
        bicla
        ${${PROJECT_NAME}_LINK_FLAGS}
        )
